//analyticsRoutes.js

import express from 'express';
import { getClassAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/class/:classId', protect, authorize('faculty', 'admin'), getClassAnalytics);

// Use query param instead of optional path param
// GET /student?studentId=123  or  /student
router.get('/student', protect, getStudentAnalytics);

export default router;

// A stateful API remembers the client’s state (session data) between multiple requests.
//Client sends a request → server knows who you are without re-authenticating every time


//A stateless API does NOT remember anything about the client.
//Every request is independent and must contain all required info.


/*“The routes folder defines the API endpoints and decides which middleware and controller 
should handle each request.” 
 They only connect things together*/

/* Client (Frontend)
        ↓
        Routes  (URL + HTTP method)
        ↓
   Middleware (auth, role check)
        ↓
   Controllers (business logic)
        ↓
   Models → MongoDB
*/


/* Each route answers 3 questions:

Which URL? → /login, /generate-qr

Which HTTP method? → GET / POST

Who handles it? → Middleware + Controller*/


//“Routes decide who can access which URL and which controller handles it.”//