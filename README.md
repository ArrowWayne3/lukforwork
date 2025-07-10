1. Registration & Login
1.1. Login
When the user isn't logged in, the site presents a login form with:

Email field (text)

Password field (password)

Submit button to login

On submission, form data is sent to POST /auth/login for verification. If there is an error, an error message appears.

1.2. Registration
The login form includes a link/button to open the register form. The register form includes:

Email field (text)

Name field (text)

Password field (password)

Confirm password field (password) — must match password, otherwise error is shown

Submit button to register

On submission, if passwords match, data is sent to POST /auth/register. Errors display appropriate messages.

1.3. Error Popups
Any error (frontend or backend) results in an error popup with a message.

Popup can be closed by pressing an "x" or "close" button.

1.4. Home Page & Logout
Upon registration or login, user is sent to the home page.

The home page always displays a "logout" button.

Logging out removes the session/token and returns to the login screen.

2. Job Feed
2.1. Feed Display
Displays a feed of job posts from watched users, fetched via GET /job/feed.

Feed is accessible only to logged-in users.

Jobs are shown in reverse chronological order (most recent first).

2.2. Job Post Content
Each job shows:

Author’s name

When it was posted:

If posted in the last 24 hours: show hours/minutes ago

If older: show date as DD/MM/YYYY

The job content, including:

Image (base64 jpg, any aspect ratio)

Job title

Start date (DD/MM/YYYY, not earlier than today)

Number of likes

Job description

Number of comments

3. Likes & Comments
3.1. Show Likes
User can view the list of all users who have liked a job.

Display options:

Shown by default on each job, or

Shown via show/hide toggle, or

Shown in a popup/modal/screen on click.

3.2. Show Comments
User can view all comments on a job, with each comment showing name and content.

Display options:

Shown by default on each job, or

Shown via show/hide toggle, or

Shown in a popup/modal/screen on click.

3.3. Liking a Job
User can like a job in the feed using PUT /job/like.

For basic functionality, the like count may not update until the feed is refreshed.

3.4. Feed Pagination
Users can page between feed results using the position token (GET /job/feed).

(Or infinite scroll can be implemented, see advanced features.)

4. User Profiles
4.1. Viewing Other Users’ Profiles
Click a user’s name (from job, like, or comment) to view their profile.

The profile page includes:

All information from GET /user for that user

All jobs posted by that user, with likes and comments

A list of all users who watch this profile, with clickable names and total count

4.2. Viewing Your Own Profile
Users can view their own profile, just like any other user’s profile.

A profile link/icon is always visible on the feed page.

4.3. Updating Your Profile
Users can update their profile via PUT /user, including:

Email, password, name, and profile image

4.4. Watching / Unwatching Users
On another user's profile, a button allows watching or unwatching (PUT /user/watch).

On the feed screen, users can watch by entering an email address in a popup.

5. Job Management
5.1. Adding a Job
Users can add new job posts via modal, component, or separate screen using POST /job.

Must provide:

Job title

Start date (DD/MM/YYYY)

Description

Image

5.2. Updating & Deleting Jobs
Users can update their own jobs (PUT /job). Each feed item has an update button for the creator.

All job details can be modified.

Each feed item also has a delete button (DELETE /job) for the creator.

5.3. Leaving Comments
Users can comment on jobs (POST /job/comment) via a comment button.

Pressing comment opens a modal with a textarea and a "comment" button.

Submitting posts the comment and closes the modal.

6. Advanced Features (Optional)
6.1. Infinite Scroll
Optionally, implement infinite scroll to load feed items as the user scrolls.

6.2. Live Update
Feed updates likes/comments in real time using polling (no reload needed).

6.3. Push Notifications
Users receive notifications when a watched user posts a job, using polling or browser notifications.

6.4. Offline Access
Most recent feed remains available offline, cached in local storage.

Attempting to interact (comment, like) while offline produces errors.

6.5. Fragment-based URL Routing
Supports direct access to:

/#feed — main feed

/#profile — user’s own profile

/#profile={userId} — specific user’s profile

7. Bonus Features
Any additional features or UX improvements (see bonus.md for descriptions).

8. Technical Stack
Frontend: Vanilla JavaScript (no frameworks)

Backend: Provided Express.js API

API endpoints used:
/auth/login, /auth/register, /job/feed, /job/like, /job, /job/comment, /user, /user/watch
