import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '../models/User.js';
import redisClient from '../config/redis.js';
import { rpName, rpID, origin } from '../config/webauthn.js';

const CHALLENGE_TTL_SECONDS = 120;

// ===== ENROLLMENT =====

export const getRegistrationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: user.webauthnCredentials.map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
      },
    });

    await redisClient.set(
      `webauthnChallenge:register:${req.user._id}`,
      options.challenge,
      { EX: CHALLENGE_TTL_SECONDS }
    );

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyRegistration = async (req, res) => {
  try {
    const expectedChallenge = await redisClient.get(
      `webauthnChallenge:register:${req.user._id}`
    );
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Registration challenge expired, try again' });
    }

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: 'Could not verify device' });
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        webauthnCredentials: {
          credentialID: credential.id,
          publicKey: Buffer.from(credential.publicKey).toString('base64url'),
          counter: credential.counter,
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: credential.transports || [],
          label: req.body.label || 'My device',
        },
      },
    });

    await redisClient.del(`webauthnChallenge:register:${req.user._id}`);
    res.json({ message: 'Device registered for biometric verification' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== PER-ATTENDANCE VERIFICATION =====

export const getAuthenticationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.webauthnCredentials.length) {
      return res.status(400).json({
        message: 'No biometric device enrolled. Set one up from your Profile first.',
      });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      allowCredentials: user.webauthnCredentials.map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
    });

    const { sessionId } = req.body;
    await redisClient.set(
      `webauthnChallenge:auth:${req.user._id}:${sessionId}`,
      options.challenge,
      { EX: CHALLENGE_TTL_SECONDS }
    );

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Called directly by attendanceController — not a route
export const verifyAuthenticationAssertion = async ({ userId, sessionId, assertionResponse }) => {
  const expectedChallenge = await redisClient.get(
    `webauthnChallenge:auth:${userId}:${sessionId}`
  );
  if (!expectedChallenge) throw new Error('Biometric challenge expired, please retry');

  const user = await User.findById(userId);
  const credential = user.webauthnCredentials.find(
    (c) => c.credentialID === assertionResponse.id
  );
  if (!credential) throw new Error('Unrecognized device');

  const verification = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialID,
      publicKey: Buffer.from(credential.publicKey, 'base64url'),
      counter: credential.counter,
      transports: credential.transports,
    },
    requireUserVerification: true,
  });
  if (!verification.verified) throw new Error('Biometric verification failed');

  credential.counter = verification.authenticationInfo.newCounter;
  await user.save();
  await redisClient.del(`webauthnChallenge:auth:${userId}:${sessionId}`);
  return true;
};