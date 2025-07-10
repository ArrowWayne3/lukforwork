//main.js

import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
//--------------------
// Login form submission logic

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch(`http://localhost:5005/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password })
    })
    .then(result => {
    if (!result.ok) {
    return result.json().then(err => { throw new Error(err.error) });
    }
    return result.json();
    })
    .then(data => {
        
    localStorage.setItem('token', data.token);
    localStorage.setItem('loggeduserId', data.userId);
    // localStorage.setItem('loggeduserId', data.us);
    showHomePage();
    })
    .catch(error => {
    alert('Login failed: ' + error.message);
    });
});

//toggle registeration page
function showRegisterForm() {
document.getElementById('login-form').style.display = 'none';
document.getElementById('register-form').style.display = 'block';
}
document.getElementById('register-btn').addEventListener('click', showRegisterForm);


// Registration form submission logic
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('register-email').value.trim();
    const name = document.getElementById('register-name').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
    const mismatchModal = new bootstrap.Modal(document.getElementById('passwordMismatchModal'));
    mismatchModal.show();
    return;
    }

    fetch('http://localhost:5005/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
    headers: {'Content-Type': 'application/json'}
    })
    .then(result => {
    if (!result.ok) {
    return result.json().then(err => { throw new Error(err.error) });
    }
    return result.json();
    })
    .then(data => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('loggeduserId', data.userId);
    showHomePage();
    })
    .catch(error => {
    alert('Registration failed: ' + error.message);
    });
});

// "Login instead" button logic (from register page back to login page)
document.getElementById('login-instead-btn').addEventListener('click', function() {
document.getElementById('register-form').style.display = 'none';
document.getElementById('login-form').style.display = 'block';
});

// Show home page and hide forms
function showHomePage() {
document.getElementById('login-form').style.display = 'none';
document.getElementById('register-form').style.display = 'none';
document.getElementById('home-page').style.display = 'block';
loadFeed();
}

// Logout button logic
document.getElementById('logout-btn').addEventListener('click', function() {
localStorage.removeItem('token');
document.getElementById('home-page').style.display = 'none';
document.getElementById('login-form').style.display = 'block';
// Clear login input fields
document.getElementById('login-email').value = '';
document.getElementById('login-password').value = '';
});

// Check if token exists on page load
window.addEventListener('DOMContentLoaded', () => {
const token = localStorage.getItem('token');
if (token) {
showHomePage();
} else {
document.getElementById('login-form').style.display = 'block';
document.getElementById('register-form').style.display = 'none';
document.getElementById('home-page').style.display = 'none';
}
});


function loadFeed(startIndex = 0) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5005/job/feed?start=${startIndex}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to load feed');
        }
        return res.json();
    })
    .then(jobs => {
        console.log("Loaded jobs:", jobs);
        displayJobs(jobs, startIndex);
        // Update the state for more data
        window.hasMoreData = jobs.length === 5;
        window.lastIndexLoaded = startIndex + jobs.length;
    })
    .catch(err => {
        console.error('Error loading feed:', err);
        window.hasMoreData = false; // Assume no more data in case of error
    });
}

window.addEventListener('scroll', () => {
    const homePageDisplay = document.getElementById('home-page').style.display;
    // Check if the user has scrolled to near the bottom of the page
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollHeight = document.documentElement.scrollHeight;
    let clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight > scrollHeight - 100 && window.hasMoreData && window.hasMoreData && homePageDisplay === 'block') {

        loadFeed(window.lastIndexLoaded);
    }
});



document.addEventListener('DOMContentLoaded', () => {
    window.hasMoreData = true; // Initially assume there's more data to load
    window.lastIndexLoaded = 0; // Start index for the API
    loadFeed(0); // Load initial data
});



function displayJobs(jobs, startIndex) {
    const feedContainer = document.getElementById('feed-container');
    if (startIndex === 0) {
        while (feedContainer.firstChild) {
            feedContainer.removeChild(feedContainer.firstChild);
        }
    }
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        feedContainer.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const jobCard = document.createElement('div');
    jobCard.classList.add('card', 'mb-3');
    jobCard.dataset.jobId = job.id;

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const postedTime = formatDateOrTimeAgo(job.createdAt);
    const startDate = formatDate(job.start);
    const likeCount = job.likes && job.likes.length ? job.likes.length : 0;
    const commentCount = job.comments && job.comments.length ? job.comments.length : 0;
    const hasLiked = check_if_liked(job.likes);
    const likeButtonLabel = hasLiked ? 'Unlike' : 'Like';

    // User profile button
    const userProfileBtn = document.createElement('button');
    userProfileBtn.classList.add('btn', 'btn-link', 'p-0', 'card-title', 'user-profile-btn');
    userProfileBtn.dataset.userId = job.creatorId;
    userProfileBtn.textContent = `Posted by: ${job.creatorId}`;

    // Edit button
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.id = 'edit_job';
    editButton.classList.add('edit-job-btn');
    editButton.textContent = 'Edit';
    editButton.style.display = 'none';

    // Posted time
    const postedPara = document.createElement('p');
    postedPara.classList.add('text-muted');
    postedPara.textContent = `Posted: ${postedTime}`;

    // Image
    const jobImage = document.createElement('img');
    jobImage.src = job.image;
    jobImage.alt = 'Job image';
    jobImage.classList.add('img-fluid', 'mb-3');

    // Title
    const title = document.createElement('h3');
    title.textContent = job.title;

    // Start date
    const startDatePara = document.createElement('p');
    startDatePara.textContent = `Start date: ${startDate}`;

    // Description
    const description = document.createElement('p');
    description.textContent = job.description;

    // Likes section
    const likesPara = document.createElement('p');
    const likesBtn = document.createElement('button');
    likesBtn.type = 'button';
    likesBtn.classList.add('btn', 'btn-link', 'p-0', 'likes-btn');
    likesBtn.dataset.jobId = job.id;
    likesBtn.textContent = `Likes: ${likeCount}`;

    const likeSpan = document.createElement('span');
    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.classList.add('btn', 'btn-secondary', 'like-btn');
    likeBtn.dataset.jobId = job.id;
    likeBtn.textContent = likeButtonLabel;

    likeSpan.appendChild(likeBtn);
    likesPara.appendChild(likesBtn);
    likesPara.appendChild(likeSpan);

    // Comments section
    const commentsPara = document.createElement('p');
    const commentsBtn = document.createElement('button');
    commentsBtn.type = 'button';
    commentsBtn.classList.add('btn', 'btn-link', 'p-0', 'comments-btn');
    commentsBtn.textContent = `Comments: ${commentCount}`;

    // Add comment button
    const addCommentBtn = document.createElement('button');
    addCommentBtn.type = 'button';
    addCommentBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'ml-2', 'add-comment-btn');
    addCommentBtn.textContent = 'Add Comment';

    // Comment input container (initially hidden)
    const commentInputDiv = document.createElement('div');
    commentInputDiv.classList.add('comment-input-container', 'mt-2');
    commentInputDiv.style.display = 'none';

    // Comment textbox
    const commentInput = document.createElement('textarea');
    commentInput.classList.add('form-control', 'mb-2');
    commentInput.placeholder = 'Enter your comment here';
    commentInput.rows = 3;

    // Submit comment button
    const submitCommentBtn = document.createElement('button');
    submitCommentBtn.type = 'button';
    submitCommentBtn.classList.add('btn', 'btn-success', 'btn-sm');
    submitCommentBtn.textContent = 'Submit Comment';

    // Assemble comment input section
    commentInputDiv.appendChild(commentInput);
    commentInputDiv.appendChild(submitCommentBtn);

    // Append elements to comments paragraph
    commentsPara.appendChild(commentsBtn);
    commentsPara.appendChild(addCommentBtn);
    commentsPara.appendChild(commentInputDiv);

    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', function() {
            // Toggle visibility of comment input
            commentInputDiv.style.display = 
                commentInputDiv.style.display === 'none' ? 'block' : 'none';
            
        });
    }
    
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', function() {
            const commentText = commentInput.value.trim();
            if (commentText) {
                // Here you would typically send the comment to your backend
                    fetch(`http://localhost:5005/job/comment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            id: job.id, // The job ID
                            comment: commentText // The comment text
                        })
                    })
                    .then(() => {
                        commentInput.value = ''; // Clear input
                        commentInputDiv.style.display = 'none'; // Hide input
                        loadFeed();
                        
                        
                    })
                    .catch(err => {
                        console.error('Failed to submit comment:', err);
                    });
            }
        });
    }


    

    // commentsPara.appendChild(commentsBtn);

    // Append all elements to card body
    cardBody.appendChild(userProfileBtn);
    cardBody.appendChild(editButton);
    cardBody.appendChild(postedPara);
    cardBody.appendChild(jobImage);
    cardBody.appendChild(title);
    cardBody.appendChild(startDatePara);
    cardBody.appendChild(description);
    cardBody.appendChild(likesPara);
    cardBody.appendChild(commentsPara);

    jobCard.appendChild(cardBody);

    // Event listeners
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            loadUserProfile(userId);
        });
    }

    if (likesBtn) {
        likesBtn.addEventListener('click', function() {
            showLikesPopup(job.likes);
        });
    }

    if (commentsBtn) {
        commentsBtn.addEventListener('click', function() {
            showCommentsPopup(job.comments);
        });
    }

    likeBtn.addEventListener('click', function() {
        toggleLikeJob(this.dataset.jobId, job.likes);
    });

    // Show edit button if user is creator
    if (localStorage.getItem('loggeduserId') == job.creatorId) {
        editButton.style.display = 'block';
    }

    // Fetch and update creator name
    getUserName(job.creatorId)
        .then(creatorName => {
            userProfileBtn.textContent    = `Posted by: ${creatorName}`;
        })
        .catch(err => {
            console.error(`Failed to get name for user ${job.creatorId}:`, err);
        });

    return jobCard;
}




document.getElementById('view-profile-btn').addEventListener('click', function() {
    const loggedUserId = localStorage.getItem('loggeduserId');
    if (loggedUserId) {

        loadUserProfile(loggedUserId);
    } else {
        alert('User ID not found. Please log in again.');
    }
});
/**
* If the job was posted today (< 24 hours ago), return "X hours and Y minutes ago".
* Otherwise, return "DD/MM/YYYY".
*/
function formatDateOrTimeAgo(isoDateString) {
    const postedDate = new Date(isoDateString);
    const now = new Date();
    const diffMs = now - postedDate; // difference in milliseconds
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

    // If posted < 24 hours ago, show hours/minutes. Otherwise, show DD/MM/YYYY.
    if (diffHours < 24) {
    return `${diffHours} hours and ${diffMinutes} minutes ago`;
    } else {
    return formatDate(isoDateString);
    }
}

/**
* Formats an ISO date string as DD/MM/YYYY.
*/
function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getUserName(userId) {
    const token = localStorage.getItem('token');
    // Important: return the promise chain here
    return fetch(`http://localhost:5005/user?userId=${userId}`, {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    },
    })
    .then(res => {
    if (!res.ok) {
    throw new Error('Failed to load user');
    }
    return res.json();
    })
    .then(data => {
    return data.name;
    })
    .catch(err => {
    console.error('Error fetching user name:', err);
    return 'Unknown';
    });
}



function showLikesPopup(likes) {
    const modalBody = document.getElementById('likesModalBody');

    // Properly empty the modal body without using innerHTML or similar methods
    while (modalBody.firstChild) {
        modalBody.removeChild(modalBody.firstChild);
    }

    if (likes && likes.length > 0) {
        const ul = document.createElement('ul');
        ul.classList.add('list-unstyled');

        likes.forEach(user => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-link');
            button.textContent = user.userName; // Safe text content insertion
            button.addEventListener('click', () => loadUserProfile(user.userId));

            li.appendChild(button); // Adding the button to the list item
            ul.appendChild(li); // Adding the list item to the unordered list
        });

        modalBody.appendChild(ul); // Adding the unordered list to the modal body
    } else {
        const noLikesText = document.createTextNode('No likes yet.'); // Safe text content insertion
        modalBody.appendChild(noLikesText);
    }

    // Initialize and show the Bootstrap modal
    const likesModal = new bootstrap.Modal(document.getElementById('likesModal'));
    likesModal.show();
}





function showCommentsPopup(comments) {
    const modalBody = document.getElementById('commentsModalBody');

    while (modalBody.firstChild) {
        modalBody.removeChild(modalBody.firstChild);
    }

    if (comments && comments.length > 0) {
        const ul = document.createElement('ul');
        ul.classList.add('list-unstyled');

        comments.forEach(comment => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-link');
            button.textContent = `${comment.userName}: ${comment.comment}`;
            button.addEventListener('click', () => loadUserProfile(comment.userId));

            li.appendChild(button); // Append the button to the list item
            ul.appendChild(li); // Append the list item to the unordered list
        });

        modalBody.appendChild(ul); // Append the unordered list to the modal body
    } else {
        const noCommentsText = document.createTextNode('No comments yet.'); // Safe text content insertion
        modalBody.appendChild(noCommentsText);
    }

    // Initialize and show the Bootstrap modal for comments
    const commentsModal = new bootstrap.Modal(document.getElementById('commentsModal'));
    commentsModal.show();
}





function check_if_liked(likes) {
    const loggedUserId = localStorage.getItem('loggeduserId'); // Ensure this matches the key used when setting
    if (likes && likes.length > 0) {
        for (const user of likes) {
            // console.log(user.userId); // Keep for debugging if needed
            // console.log(loggedUserId); // Keep for debugging if needed
            // Ensure consistent type comparison (string vs string or number vs number)
            // Assuming loggeduserId is stored as a string and user.userId might be number or string
            if (String(user.userId) === String(loggedUserId)) {
                // console.log("User has liked."); // Keep for debugging if needed
                return true; // Correctly exits with `true` when a match is found
            }
        }
    }
    return false; // Returns `false` if no match is found or `likes` is empty
};

function toggleLikeJob(jobId, likes) {
    var currentlyLiked = check_if_liked(likes);
    
    const turnonValue = !currentlyLiked;
    console.log(`Attempting to change like status for job ${jobId}. Current like status: ${currentlyLiked}. Sending turnon: ${turnonValue}`);

    const token = localStorage.getItem('token');
    const url = 'http://localhost:5005/job/like';

    const body = JSON.stringify({
        id: jobId,
        turnon: turnonValue // Send the desired new state
    });

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            // Try to parse error message from backend
            return response.json().then(err => { throw new Error(err.error || 'Failed to update like status') });
        }
        return response.json(); // Should return {} on success based on spec
    })
    .then(data => {
        console.log('Like status changed successfully:', data);

        loadFeed();

        
        const jobCardElement = document.querySelector(`.card[data-job-id="${jobId}"]`);
        if (jobCardElement) {
            const likeButton = jobCardElement.querySelector('.like-btn');
            const likesButton = jobCardElement.querySelector('.likes-btn'); // Button showing the count
            // Assuming likesButton text is like "Likes: 5"
            const currentCountMatch = likesButton.textContent.match(/Likes: (\d+)/);
            let currentCount = currentCountMatch ? parseInt(currentCountMatch[1], 10) : 0;

            if (turnonValue === true) { // Action was to like
                likeButton.textContent = 'Unlike';
                likesButton.textContent = `Likes: ${currentCount + 1}`;
            } else { // Action was to unlike
                likeButton.textContent = 'Like';
                likesButton.textContent = `Likes: ${Math.max(0, currentCount - 1)}`; // Avoid negative counts
            }

        }
        
      

    })
    .catch(error => {
        console.error('Error changing like status:', error);
        alert('Error: ' + error.message); // Inform the user
    });
}


function loadUserProfile(userId) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:5005/user?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        return response.json();
    })
    .then(userDetails => {
        console.log("userdetails:", userDetails);
        localStorage.setItem('userEmail', userDetails.email);

        displayUserProfile(userDetails);
        
        displayJobsUSerProfiles(userDetails.jobs,userId); // Assuming jobs are included in the userDetails

        // Show or hide the edit button based on whether the profile belongs to the logged user
        const editProfileButton = document.getElementById('edit-profile-btn');
        const loggedUserId = localStorage.getItem('loggeduserId');
        const addjob = document.getElementById('add-job-btn');

        if (userId == loggedUserId) {
            editProfileButton.style.display = 'block'; // Show the button if it's the user's own profile
            addjob.style.display='block';

        } else {
            editProfileButton.style.display = 'none'; // Hide the button otherwise
            addjob.style.display='none';
        }
    })
    .catch(error => console.error('Error fetching user details:', error));
}


function displayUserProfile(userDetails) {
    showProfilePage();
    console.log("inside function display user profile", userDetails);
    
    const profilePage = document.getElementById('profile-page');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileImage = document.getElementById('profile-image');
    const noImageBox = document.getElementById('no-image-box');
    const watchedByList = document.getElementById('watched-by-list');
    const watchedByCount = document.getElementById('watched-by-count');
    const watchToggleButton = document.getElementById('watch-toggle-btn');

    // Display user info
    profileName.textContent = userDetails.name || 'No name provided';
    profileEmail.textContent = userDetails.email || 'No email provided';

    // Display image if exists or "no image" placeholder
    if (userDetails.image) {
        profileImage.src = userDetails.image;
        profileImage.style.display = 'block';
        noImageBox.style.display = 'none';
    } else {
        profileImage.style.display = 'none';
        noImageBox.style.display = 'block';
        
        // Clear existing content
        while (noImageBox.firstChild) {
            noImageBox.removeChild(noImageBox.firstChild);
        }
        // Create and append paragraph
        const noImageText = document.createElement('p');
        noImageText.textContent = 'No profile pic';
        noImageBox.appendChild(noImageText);
    }

    const loggedUserId = localStorage.getItem('loggeduserId');
    const isWatching = userDetails.usersWhoWatchMeUserIds.includes(parseInt(loggedUserId));
    watchToggleButton.textContent = isWatching ? 'Unwatch' : 'Watch';

    // Add event listener to toggle watch status
    watchToggleButton.onclick = function() {
        toggleWatching(userDetails.id, userDetails.email, isWatching);
    };

    // Show the profile page
    profilePage.style.display = 'block';

    // Display watched-by list
    // Clear existing list
    while (watchedByList.firstChild) {
        watchedByList.removeChild(watchedByList.firstChild);
    }
    
    if (userDetails.usersWhoWatchMeUserIds && userDetails.usersWhoWatchMeUserIds.length > 0) {
        userDetails.usersWhoWatchMeUserIds.forEach(userId => {
            const li = document.createElement('li');
            li.textContent = 'User ID: ' + userId;
            watchedByList.appendChild(li);
        });
        watchedByCount.textContent = userDetails.usersWhoWatchMeUserIds.length;
    } else {
        watchedByCount.textContent = '0';
    }

    // Show the profile page (already set above, keeping for consistency with original)
    profilePage.style.display = 'block';
}

function displayJobsUSerProfiles(jobs, userid) {
    // 1) Sort the jobs by creation date descending (most recent first)
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 2) Clear out the feed container
    const feedContainer = document.getElementById('profile-jobs-container');
    while (feedContainer.firstChild) {
        feedContainer.removeChild(feedContainer.firstChild);
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('card', 'mb-3');
        jobCard.dataset.jobId = job.id;

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const postedTime = formatDateOrTimeAgo(job.createdAt);
        const startDate = formatDate(job.start);
        const likeCount = job.likes && job.likes.length ? job.likes.length : 0;
        const commentCount = job.comments && job.comments.length ? job.comments.length : 0;
        const hasLiked = check_if_liked(job.likes);
        const likeButtonLabel = hasLiked ? 'Unlike' : 'Like';

        // User profile button
        const userProfileBtn = document.createElement('button');
        userProfileBtn.classList.add('btn', 'btn-link', 'p-0', 'card-title', 'user-profile-btn');
        userProfileBtn.dataset.userId = job.creatorId;
        userProfileBtn.textContent = `Posted by: ${job.creatorId}`;

        // Posted time
        const postedPara = document.createElement('p');
        postedPara.classList.add('text-muted');
        postedPara.textContent = `Posted: ${postedTime}`;

        // Edit button
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.id = 'edit-job';
        editButton.classList.add('edit-job-btn');
        editButton.textContent = 'Edit';
        editButton.style.display = 'none';

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.id = 'delete-job';
        deleteButton.classList.add('delete-job-btn');
        deleteButton.textContent = 'Delete';
        deleteButton.style.display = 'none';

        // Image
        const jobImage = document.createElement('img');
        jobImage.src = job.image;
        jobImage.alt = 'Job image';
        jobImage.classList.add('img-fluid', 'mb-3');

        // Title
        const title = document.createElement('h3');
        title.textContent = job.title;

        // Start date
        const startDatePara = document.createElement('p');
        startDatePara.textContent = `Start date: ${startDate}`;

        // Description
        const description = document.createElement('p');
        description.textContent = job.description;

        // Likes section
        const likesPara = document.createElement('p');
        const likesBtn = document.createElement('button');
        likesBtn.type = 'button';
        likesBtn.classList.add('btn', 'btn-link', 'p-0', 'likes-btn');
        likesBtn.dataset.jobId = job.id;
        likesBtn.textContent = `Likes: ${likeCount}`;

        const likeSpan = document.createElement('span');
        const likeBtn = document.createElement('button');
        likeBtn.type = 'button';
        likeBtn.classList.add('btn', 'btn-secondary', 'like-btn');
        likeBtn.dataset.jobId = job.id;
        likeBtn.textContent = likeButtonLabel;

        likeSpan.appendChild(likeBtn);
        likesPara.appendChild(likesBtn);
        likesPara.appendChild(likeSpan);

        // Comments section
        const commentsPara = document.createElement('p');
        const commentsBtn = document.createElement('button');
        commentsBtn.type = 'button';
        commentsBtn.classList.add('btn', 'btn-link', 'p-0', 'comments-btn');
        commentsBtn.textContent = `Comments: ${commentCount}`;

        commentsPara.appendChild(commentsBtn);

        // Append all elements to card body
        cardBody.appendChild(userProfileBtn);
        cardBody.appendChild(postedPara);
        cardBody.appendChild(editButton);
        cardBody.appendChild(deleteButton);
        cardBody.appendChild(jobImage);
        cardBody.appendChild(title);
        cardBody.appendChild(startDatePara);
        cardBody.appendChild(description);
        cardBody.appendChild(likesPara);
        cardBody.appendChild(commentsPara);

        jobCard.appendChild(cardBody);
        feedContainer.appendChild(jobCard);

        // Show edit/delete buttons if user is creator
        if (localStorage.getItem('loggeduserId') == job.creatorId) {
            editButton.style.display = 'block';
            deleteButton.style.display = 'block';
        }

        // Event listeners
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', function() {
                const userId = this.dataset.userId;
                loadUserProfile(userId);
            });
        }

        if (likesBtn) {
            likesBtn.addEventListener('click', function() {
                showLikesPopup(job.likes);
            });
        }

        if (commentsBtn) {
            commentsBtn.addEventListener('click', function() {
                showCommentsPopup(job.comments);
            });
        }

        likeBtn.addEventListener('click', function() {
            toggleLikeJobonProfile(this.dataset.jobId, job.likes, userid);
        });

        editButton.addEventListener('click', function() {
            updatejob(job);
        });

        deleteButton.addEventListener('click', function() {
            console.log("delete Job ID", job.id);
            deleteJob(job.id);
        });

        // Fetch and update creator name
        getUserName(job.creatorId)
            .then(creatorName => {
                userProfileBtn.textContent = `Posted by: ${creatorName}`;
            })
            .catch(err => {
                console.error(`Failed to get name for user ${job.creatorId}:`, err);
            });
    });
}

function toggleLikeJobonProfile(jobId, likes,userid) {
    var currentlyLiked = check_if_liked(likes);
    
    const turnonValue = !currentlyLiked;
    console.log(`Attempting to change like status for job ${jobId}. Current like status: ${currentlyLiked}. Sending turnon: ${turnonValue}`);

    const token = localStorage.getItem('token');
    const url = 'http://localhost:5005/job/like';

    const body = JSON.stringify({
        id: jobId,
        turnon: turnonValue // Send the desired new state
    });

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            // Try to parse error message from backend
            return response.json().then(err => { throw new Error(err.error || 'Failed to update like status') });
        }
        return response.json(); // Should return {} on success based on spec
    })
    .then(data => {
        console.log('Like status changed successfully:', data);

        loadUserProfile(userid);

        
        const jobCardElement = document.querySelector(`.card[data-job-id="${jobId}"]`);
        if (jobCardElement) {
            const likeButton = jobCardElement.querySelector('.like-btn');
            const likesButton = jobCardElement.querySelector('.likes-btn'); // Button showing the count
            // Assuming likesButton text is like "Likes: 5"
            const currentCountMatch = likesButton.textContent.match(/Likes: (\d+)/);
            let currentCount = currentCountMatch ? parseInt(currentCountMatch[1], 10) : 0;

            if (turnonValue === true) { // Action was to like
                likeButton.textContent = 'Unlike';
                likesButton.textContent = `Likes: ${currentCount + 1}`;
            } else { // Action was to unlike
                likeButton.textContent = 'Like';
                likesButton.textContent = `Likes: ${Math.max(0, currentCount - 1)}`; // Avoid negative counts
            }

        }
        
      

    })
    .catch(error => {
        console.error('Error changing like status:', error);
        alert('Error: ' + error.message); // Inform the user
    });
}


function showProfilePage() {
    const homePage = document.getElementById('home-page');
    const profilePage = document.getElementById('profile-page');
    
    homePage.style.display = 'none';
    profilePage.style.display = 'block';
}
//back to feed page from personal profile page

document.addEventListener('DOMContentLoaded', function() 
{
    const backToFeedButton = document.getElementById('back-to-feed-btn');
    
    if (backToFeedButton) {
        backToFeedButton.addEventListener('click', function() {
            const profilePage = document.getElementById('profile-page');
            profilePage.style.display = 'none';
            showHomePage(); 
        });
    }
});
//from profile to edit page
document.addEventListener('DOMContentLoaded', function() {
    const editProfileButton = document.getElementById('edit-profile-btn');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            showEditProfilePage();
        });
    }
});
//cancel edit and back to profile page
document.addEventListener('DOMContentLoaded', function() {
    const editProfileButton = document.getElementById('cancelEditButton');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            const editProfile = document.getElementById('edit-profile-page');
            const profilePage = document.getElementById('profile-page');
            
            
            editProfile.style.display = 'none';
            profilePage.style.display = 'block';
            
        });
    }
});
//submit edit changes and go to profile page
document.addEventListener('DOMContentLoaded', function() {
    const submitProfileButton = document.getElementById('submitProfileChange');
    if (submitProfileButton) {
        submitProfileButton.addEventListener('click', function() {
            var name = document.getElementById('name').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            var imageFile;
            try{
                imageFile = document.getElementById('profile-image').files[0];
                console.log("Image:", imageFile);
            }
            catch{
                console.log("UNALBE TO READ IMAGE")
            }
            

            console.log("Name:", name);
            console.log("Email:", email);
            console.log("Password:", password);
            

            updateProfile(name, email, password, imageFile);
            const editProfile = document.getElementById('edit-profile-page');
            const profilePage = document.getElementById('profile-page');
            
            editProfile.style.display = 'none';
            profilePage.style.display = 'block'; 
            

        });
    }
});

function showEditProfilePage(){
    const editProfile = document.getElementById('edit-profile-page');
    const profilePage = document.getElementById('profile-page');
    
    profilePage.style.display = 'none';
    editProfile.style.display = 'block';
    

}

function updateProfile(name, email, password, base64Image) {
    var useremail = localStorage.getItem('userEmail');
    console.log(useremail);
    var payload={};
    if(name){
        payload.name = name;
    }
    if (email && email !== useremail) {
        payload.email = email;
    }
    if (password) {
        payload.password = password;
    }
    if (base64Image) {
        payload.image = base64Image;
    }
    console.log("payload keys length", Object.keys(payload).length)
    if (Object.keys(payload).length==0){
        console.log("nothing to change");
        return;

    }
    fetch('http://localhost:5005/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
    
            if (response.status === 403) {
                return response.json().then(error => { throw new Error('Authentication failed: ' + error.error); });
            }
            return response.text().then(text => { throw new Error(text || 'Unknown error during update'); });
        }
        return response.text().then(text => text ? JSON.parse(text) : {});
    })
    .then(data => {
        console.log('Profile updated successfully:', data);
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;

        
        // const editProfile = document.getElementById('edit-profile-page');
        // const profilePage = document.getElementById('profile-page');
        
        // editProfile.style.display = 'none';
        // profilePage.style.display = 'block';
        

    })
    .catch(error => {
        console.error('Error updating profile:', error);
        alert('Error: ' + error.message);
    });
}

function toggleWatching(userid,email, isCurrentlyWatching) {
    console.log("inside toggle watching",email,isCurrentlyWatching,userid);
    fetch(`http://localhost:5005/user/watch`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email:email, turnon: !isCurrentlyWatching })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to toggle watch status');
        }
        return response.json();
    })
    .then(() => {
        alert(isCurrentlyWatching ? 'You are no longer watching this user.' : 'You are now watching this user.');
        console.log("watching toggle",userid);
        loadUserProfile(userid);
        
    })
    .catch(error => {
        console.error('Error toggling watch status:', error);
        alert('Error: ' + error.message);
    });
}

//to add job
document.addEventListener('DOMContentLoaded', function() {
    const addjobbutton = document.getElementById('add-job-btn');
    if (addjobbutton) {
        addjobbutton.addEventListener('click', function() {
            const addjobpage = document.getElementById('add-job-page');
            const profilePage = document.getElementById('profile-page');
            
            
            profilePage.style.display = 'none';
            addjobpage.style.display = 'block';  
            
        });
    }
});
//cancel button is pressed on add job page
document.addEventListener('DOMContentLoaded', function() {
    const canceljob = document.getElementById('cancelJobButton');
    if (canceljob) {
        canceljob.addEventListener('click', function() {
            const addjobpage = document.getElementById('add-job-page');
            const profilePage = document.getElementById('profile-page');
            
            
            addjobpage.style.display = 'none'; 
            profilePage.style.display = 'block'; 
            
        });
    }
});

//clicked submit on add job page
document.addEventListener('DOMContentLoaded', function() {
    const submitJobButton = document.getElementById('submitJob');
    if (submitJobButton) {
        submitJobButton.addEventListener('click', function() {
            var jobTitle = document.getElementById('job-title').value;
            var jobDate = document.getElementById('profile-start').value;
            var jobDescription = document.getElementById('job-description').value;
            var jobImageFile = document.getElementById('job-image').files[0];
            
            
            if (!jobTitle) {
                alert('Please enter a job title.');
                return; // Stop the function from proceeding further
            }
            if (!jobDate) {
                alert('Please enter a start date for the job.');
                return; // Stop the function from proceeding further
            }
            if (!jobDescription) {
                alert('Please enter a description for the job.');
                return; // Stop the function from proceeding further
            }
            
            var startIsoString = new Date(jobDate).toISOString();
            if (jobImageFile) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var base64Image = e.target.result; // This is the Base64 string of the image

                    // Create the job JSON object to send to the server
                    var jobData = {
                        title: jobTitle,
                        start: startIsoString,
                        description: jobDescription,
                        image: base64Image
                    };

                    
                    // Send the job data to the server via Fetch API
                    fetch('http://localhost:5005/job', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(jobData)
                    })
                    .then(response => response.json())
                    .then(data => console.log('Job posted successfully:', data))
                    .then(
                        loadUserProfile(localStorage.getItem('loggeduserId'))
                    )
                    .catch(error => console.error('Error posting job:', error));
                };
                const addjobpage = document.getElementById('add-job-page');
                const profilePage = document.getElementById('profile-page');
                
                
                addjobpage.style.display = 'none'; 
                profilePage.style.display = 'block';
                            reader.readAsDataURL(jobImageFile);
            } else {
                // Handle the case where no image is provided
                alert("Please upload job image")
                console.log("No image file selected.");
            }
        });
    }
});

//show edit job page

function updatejob(job) {
    const editJobPage = document.getElementById('edit-job-page');
    const profilePage = document.getElementById('profile-page');

    // Hide the profile page and show the edit job form
    profilePage.style.display = 'none'; 
    editJobPage.style.display = 'block'; 

    var startDate = new Date(job.start);
    var formattedDate = startDate.toISOString().substring(0, 16)

    // Prefill the form fields with the current job details
    document.getElementById('job-current-image').value = job.image;
    document.getElementById('edit-job-Id').value = job.id;
    document.getElementById('edit-job-title').value = job.title;
    document.getElementById('edit-profile-start').value = formattedDate;
    document.getElementById('edit-job-description').value = job.description;
    // For the image, you might want to handle it differently based on your needs
}

//cancel button is pressed on edit job page
document.addEventListener('DOMContentLoaded', function() {
    const cancelEdit = document.getElementById('cancelEditJob');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', function() {
            const editpage = document.getElementById('edit-job-page');
            const profilePage = document.getElementById('profile-page');
            
            
            editpage.style.display = 'none'; 
            profilePage.style.display = 'block'; 
            
        });
    }
});


//submit button is pressed on edit job page
document.addEventListener('DOMContentLoaded', function() {
    const updatejob = document.getElementById('updateJob');
    if (updatejob) {
        updatejob.addEventListener('click', function() {
            const jobId = document.getElementById('edit-job-Id').value;
            const title = document.getElementById('edit-job-title').value;
            const start = new Date(document.getElementById('edit-profile-start').value).toISOString();
            const description = document.getElementById('edit-job-description').value;
            const imageFile = document.getElementById('job-current-image').value;

            var jobImageFile = document.getElementById('edit-job-image').files[0];

            console.log("update clicked", jobId, title,start,description)

            if (jobImageFile) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var base64Image = e.target.result; // This is the Base64 string of the image

                    // Create the job JSON object to send to the server
                    var jobData = {
                        id:jobId,
                        title:title,
                        image: base64Image,
                        start:start,
                        description:description
                        
                    };

                    
                    // Send the job data to the server via Fetch API
                    fetch('http://localhost:5005/job', {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(jobData)
                    })
                    .then(response => response.json())
                    .then(data => console.log('Job edited successfully:', data))
                    .catch(error => console.error('Error editing job:', error));
                };
                reader.readAsDataURL(jobImageFile);
            } else {
                // Handle the case where no image is provided
                console.log("No image file selected.");
                var jobData = {
                    id:jobId,
                    title:title,
                    image: imageFile,
                    start:start,
                    description:description
                    
                };
                fetch('http://localhost:5005/job', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(jobData)
                })
                .then(response => response.json())
                .then(data => console.log('Job edited successfully:', data))
                .catch(error => console.error('Error editing job:', error));
                

            }
            const editpage = document.getElementById('edit-job-page');
            editpage.style.display = 'none';
            loadUserProfile(localStorage.getItem('loggeduserId'));
        
        });
    }
});



function deleteJob(jobId) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5005/job`, { // Assuming your base URL is correct
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: jobId }) // Send job ID in request body as specified by your API
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error('Failed to delete job: ' + err.message); });
        }
        return response.json();
    })
    .then(() => {        
        console.log('Job deleted successfully');
        loadUserProfile(localStorage.getItem('loggeduserId'));
    })
    .catch(error => {
        console.error('Error deleting job:', error);
        alert('Error deleting job: ' + error.message);
    });
}



console.log('Let\'s go!');