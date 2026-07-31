# ClientSphere Architecture Decisions

## 1. Data Modeling
- Use referencing for Organization, User, Client, Project, Task, Comment, Notification, Activity Log, and File Metadata.
- Embed only Subtasks inside the Task document.
- Do not embed Projects inside Clients.
- Do not embed Tasks inside Projects.

## 2. File Upload
- Use signed Cloudinary uploads.
- Backend generates signed upload parameters.
- Frontend uploads directly to Cloudinary.
- Backend stores only file metadata.

## 3. Activity Logging
- Use explicit service calls.
- Do not use Mongoose middleware/hooks.
- Activity logs are append-only.

## 4. JWT Authentication
- Access Token: 15 minutes.
- Refresh Token: 7 days.
- Store Refresh Token in HttpOnly cookie.
- Re-authenticate after Refresh Token expiry.

## 5. Visibility
- Enum:
  - INTERNAL
  - CLIENT_SHARED
- Default: INTERNAL.
- Only Administrator and Manager can change visibility.

## 6. Client User Provisioning
- Client entity creation does not create a Client User.
- Client Users are invited separately.
- Associate the Client User after invitation acceptance.

## 7. Rate Limiting
- Use express-rate-limit.
- Apply to login, password reset, invitation, and AI endpoints.
- No CAPTCHA in Version 1.

## 8. Environment Configuration
- Use .env locally.
- Maintain .env.example.
- Use Render and Vercel environment variables in production.
- Never commit .env.

## 9. Architecture
Controller → Service → Repository → Model
- Controllers remain thin.
- Business logic belongs only in Services.
- Repositories handle all database operations.
- Models contain only schema definitions.
- Controllers never access Mongoose models directly.
