const form = document.querySelector(".login");
const navCenter = document.querySelector(".nav-center");
const userPanel = document.querySelector(".user-panel");
const avatarLink = document.querySelector(".avatar-link");
const avatarImg = document.querySelector(".avatar");
const logoutBtn = document.querySelector(".logout");
const popupEl = document.querySelector('#popup');
const formEl = document.querySelector('.createblogpost');
const openBtn = document.querySelector('[data-open="post"]');
const closeBtn = popupEl?.querySelector('[data-close]');
const chatOpenBtn = document.querySelector('[data-open="test"');
const chatpopUpEl = document.querySelector("#chatpopup");
const chatCloseBtn = chatpopUpEl?.querySelector('[data-close]');
const submitBtn = formEl?.querySelector('[type="submit"]');
const container = document.getElementById('blog-posts-container');
const createBlogPostBtn = document.querySelector('.btn');
const postBar = document.querySelector(".post-nav-bar");

var username = null;
var stompClient = null;
var chatPage = document.querySelector('.chat-popup');
var messageForm = document.querySelector('.chat-send-message');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#chat-message-area');
var connectingElement = document.querySelector('.connection');
var connectUsername = document.querySelector('#open-chat');

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];
const saveblogUrl = '/api/v1/blog/saveblogpost';
const loginUrl = "/api/v1/users/auth/login";
const getAllBlogPostUrl = '/api/v1/blog/getallblogpost'
const findCommentsUrl = "/api/v1/comments/getcomment/"
const addCommentsUrl = "/api/v1/comments/addcomment"
const deleteCommentsUrl = "/api/v1/comments/delete/"
const deleteBlogUrl = '/api/v1/blog/deletepost/'
const updateUrl = '/api/v1/blog/update/'


logoutBtn?.addEventListener("click", logout);


form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const creds = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(creds)
        });

        if (!res.ok) {
            document.querySelector('.js_username').style.color = "red";
            document.querySelector('.js_password').style.color = "red";
            const container = document.querySelector(".wrong-credentials");
            const wrongPassword = document.createElement('p');
            wrongPassword.classList.add('wrong-password');
            wrongPassword.innerText = 'Wrong username or password';
            container.appendChild(wrongPassword);
            throw new Error(`Login failed: ${res.status}`);
        }

        const { accessToken, username } = await res.json();
        if (!accessToken) throw new Error("Intet token i respons");

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("username", username);
        renderAfterAuth();
    } catch (err) {
    }
});


document.addEventListener("DOMContentLoaded", () => {
    renderAfterAuth();
});

window.addEventListener("storage", (e) => {
    if (e.key === "accessToken" || e.key === "username") {
        renderAfterAuth();
    }
});



function getToken() {
    return localStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return localStorage.getItem("username");
}

function logout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("username");
    form?.reset();
    renderAfterAuth();
}


function renderAfterAuth() {
    const token = getToken();
    const name = getUsernameByToken();

    const isLoggedIn = Boolean(token && name);

    if (token && name) {
        if (form) form.style.display = "none";
        if (userPanel) userPanel.style.display = "flex";
        if (connectUsername) connectUsername.style.display = "grid";
        if (createBlogPostBtn) createBlogPostBtn.style.display = "flex";
        if (postBar) postBar.style.display = "flex";


        if (avatarLink) {
            avatarLink.href = `userprofile.html?id=${encodeURIComponent(name)}`;
        }
        if (avatarImg) {
            avatarImg.src = `images/${encodeURIComponent(name)}.jpeg`;
            avatarImg.alt = name;
        }

        if (navCenter) navCenter.style.visibility = "visible";
    } else {
        if (form) form.style.display = "flex";
        if (userPanel) userPanel.style.display = "none";
        //if(navCenter) navCenter.style.visibility = "hidden";
        if (postBar) postBar.style.display = "none";
        if (createBlogPostBtn) createBlogPostBtn.style.display = "none";
        if (connectUsername) connectUsername.style.display = "none";
    }
}


var date = new Date().toISOString().slice(0, 10);

function createBlogBox(blog) {
    return `
    <div class="blog-section" data-blog-id="${blog.blogId}" id="${blog.blogId}">
        <div class="blog-box">
            <div class="blog-userInfo-logo">
                <a href="userprofile.html?id=${blog.author?.name}" target="_blank"> <img src="images/${blog.author?.imgPath || 'default.jpeg'}"></a>
                <p id="${blog.blogId}-author" data-blog-name=${blog.author?.name}>${blog.author?.name || 'Unknown'}</p>
                <div class="actions" id="${blog.blogId}-actions">
                ${blog.author?.name === getUsernameByToken() ? `<i onclick="editBlog(${blog.blogId})" class="fa-solid fa-pen-to-square"></i> <i onclick="deleteBlog(${blog.blogId})" 
                class="fa-solid fa-trash"></i>` : ""}
                </div>
            </div>
            <div id="${blog.blogId}-body">
            <div class="blog-post-subject">
                <a href="blogsite.html?id=${blog.blogId}" id="${blog.blogId}-subject"><h2>${blog.subject}</h2></a>
                <p id="${blog.blogId}-date">${blog.publishDate || ""}</p>
            </div>
            <div class="blog-post-body">
                <pre id="${blog.blogId}-tekst" class="body-test">${blog.body}</pre>
            </div>
            </div>
            <div class="blog-interaction">
                <div class="blog-likes-section">
                    <ul>
                        <li><p class="interaction"><i class="fa-regular fa-thumbs-up"></i></a></li>
                        <li><p class="interaction" onclick="scrollToComment(${blog.blogId})"><i class="fa-regular fa-comments"></i></a></li>
                        <li><p class="interaction" onclick="copyUrl(${blog.blogId})"><i class="fa-regular fa-share-from-square"></i></p></li>
                        <div class="urlcopied">
                        <span> Blog link has been copied to your clipboard </span>
                        </div>
                    </ul>
                </div>
                <div class="blog-see-all-comments"></div>
                ${getToken() !== null ? `   
                                    <div class="blog-add-comments">
                            <form class="post-add-comment" data-blog-id="${blog.blogId}">
                            <label class="sr-only" for="comment-input-${blog.blogId}"></label>
                            <input class="comment-input" 
                            name="comment" 
                            id="comment-input-${blog.blogId}" 
                            type="text" 
                            placeholder="Add a comment…" />
                            <button class="btn" type="submit" id="add-comment">Send</button>
                        </form>
                    ` : ""}

                </div>
            </div>
        </div>
    </div>
    `;
}

function scrollToComment(id) {
    const commentIcon = document.getElementById("comment-input-" + id);

    commentIcon.focus();
}

function editBlog(id) {
    const editBody = document.getElementById(id +"-body");
    const editDate = document.getElementById(id + "-date");
    const saveButton = document.getElementById(id + "-actions");
    const existing = saveButton.querySelector(".fa-paper-plane");
    if (editBody.contentEditable === "true") {
        editBody.contentEditable = "false";
        editDate.contentEditable = "false";
        existing.remove();
    } else {
        editBody.contentEditable = "true";
        editDate.contentEditable = "false";

        
        if(existing) {
            existing.remove();
        } else {
        const button = document.createElement(`i`);
        button.classList.add("fa-solid", "fa-paper-plane");
        saveButton.appendChild(button);
        button.addEventListener('click', () => updateBlogPost(id));
        }

    }
}


function updateBlogPost(id) {
    const input = document.getElementById(id + "-tekst");
    const inputSubject = document.getElementById(id +"-subject");
    const value = input.textContent;
    const valueSubject = inputSubject.textContent;
    const token = getToken();
    console.log(value);
    fetch(updateUrl + id, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json',
        },
        body: value
    })
        .then(res => res.text())
        .then(data => {
            console.log("Postopdateret : " + data);
            const edit = document.getElementById(id + "-body");
            const saveButton = document.getElementById(id + "-actions");
            const existing = saveButton.querySelector(".fa-paper-plane");
            edit.contentEditable ="false";
            existing.remove();
            
        })
        .catch(error => console.error("Kunne ikke slette: " + error));
}

fetch(getAllBlogPostUrl)
    .then(res => res.json())
    .then(data => {

        container.innerHTML = data.map(createBlogBox).join('');

        document.querySelectorAll('.blog-section').forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.blog-see-all-comments');
            const userAuthor = section.querySelector("p").dataset.blogName;
            fetch(`${findCommentsUrl}${blogId}`)
                .then(res => res.json())
                .then(comments => {
                    if (!comments || comments.length === 0) {
                        commentsContainer.innerHTML = "";
                        return;
                    }
                    commentsContainer.innerHTML = comments
                        .map(c => `<p id="${c.commentId}">${c.username}: <br> ${c.comment}
                            ${c.username ===
                                getUsernameByToken() ? `<i onclick="deleteComment(${c.commentId})" 
                            style="cursor: pointer;" class="fa-solid fa-trash"></i></p>` : ""}
                            `)
                        .join('');
                })
                .catch(err => {
                    commentsContainer.innerHTML = `<p> Could not load comments </p>`
                    console.error(err);
                }
                )
        });
        document.querySelectorAll('.post-add-comment').forEach(form => {
            form.addEventListener('submit', addComment);

            const input = form.querySelector('.comment-input');
            if (!input) {
                console.error("Input field not found");
                return;
            }
            input.addEventListener('keydown', function (event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    form.requestSubmit();
                }
            });
        });
    })
    .catch(err => {
        container.innerHTML = `<p>Failed to load blog posts ${err}.</p>`;
        console.error(err);
    });

function deleteComment(id) {
    if (!confirm("Are you sure?")) return;
    const token = getToken();
    fetch(deleteCommentsUrl + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).remove();
        })
        .catch(error => console.error("Kunne ikke slette: " + error));
}

function deleteBlog(id) {
    if (!confirm("Are you sure?")) return;
    const token = getToken();
    fetch(deleteBlogUrl + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).remove();
        })
        .catch(error => console.error("Kunne ikke slette: " + error));
}

function addComment(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('.comment-input');
    const commentsToSend = input.value.trim();
    const token = getToken();

    if (!token) {
        alert("Du er ikke logget ind, så du kan ikke kommenterer");
        return;
    }

    if (!commentsToSend) {
        alert("Kommentaren kan ikke være tom");
        return;
    }

    const blogId = form.dataset.blogId;
    const userId = null;

    const send = {
        comment: commentsToSend,
        blogId: parseInt(blogId),
        userId: userId,
        date: date
    };

    fetch(addCommentsUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(send)
    })
        .then(res => res.json())
        .then(data => {
            input.value = "";
        })
        .catch(error => console.error("fejl ved kommentar: ", error));
}

function openPopup() {
    if (!popupEl) return;
    popupEl.classList.add('active');
    document.addEventListener('keydown', escHandler);
}

function closePopup() {
    if (!popupEl) return;
    popupEl.classList.remove('active');
    document.removeEventListener('keydown', escHandler);
    formEl?.reset();
}

function escHandler(e) {
    if (e.key === 'Escape') closePopup();
}

openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup();
});

chatOpenBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    chatOpenPopUp();
});

chatCloseBtn?.addEventListener('click', () => chatClosePopUp());

function chatOpenPopUp() {
    if (!chatpopUpEl) return;
    chatpopUpEl.classList.add('active');
    document.addEventListener('keydown', escHandler);
}

function chatClosePopUp() {
    if (!chatpopUpEl) return;
    chatpopUpEl.classList.remove('active');
    document.removeEventListener('keydown', escHandler)
}

closeBtn?.addEventListener('click', () => closePopup());

formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const token = getToken();
        if (!token) throw new Error('Du er ikke logget ind');

        const fd = new FormData(formEl);
        fd.set('publishDate', date);
        const payload = Object.fromEntries(fd);

        const res = await fetch(saveblogUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || `Fejl: ${res.status}`);
        }

        const data = await res.json();

        closePopup();

    } catch (err) {
        console.error(err);
        alert(err.message || 'Noget gik galt');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create blog post';
    }
});

function connect(event) {
    username = getUsernameByToken();

    if (username) {
        var socket = new SockJS('/ws');
        console.log(socket);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);

    stompClient.send("/app/chat.addUser", {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    )

    connectingElement.classList.add('hidden');
}

function onError(error) {

}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');

    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        const p = document.createElement('p');
        p.textContent = message.type === 'JOIN' ? `${message.sender} joined!` : `${message.sender} left!`;
        messageElement.appendChild(p);
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.text = (message.sender || '?')[0].toUpperCase();
        avatarElement.style.backgroundColor = getAvatarColor(message.sender || 'unknown');

        const header = document.createElement('div')
        header.classList.add('chat-header-row');
        const name = document.createElement('span');
        name.classList.add('chat-username');
        name.textContent = message.sender || 'Unknown';
        header.appendChild(name);

        const text = document.createElement('p');
        text.classList.add('chat-text');
        text.textContent = message.content || '';

        const body = document.createElement('div');
        body.classList.add('chat-body');
        body.appendChild(header);
        body.appendChild(text);

        messageElement.appendChild(avatarElement)
        messageElement.appendChild(body);
    }

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function copyUrl(id) {
    const copyLink = "/blogsite.html?id=" + id;
    navigator.clipboard.writeText(copyLink);
    const test = document.querySelector(".urlcopied");
    test.style.display = "flex";
    test.classList.remove("fade-out");
    test.classList.add("fade-in");

    setTimeout(() => {
        test.classList.remove("fade-in");
        test.classList.add("fade-out");
    }, 2000);

    setTimeout(() => {
        test.style.display = "none";
        test.classList.remove("fade-out");
    }, 3000);
}


console.log(connectUsername);

connectUsername.addEventListener('click', connect, true);
messageForm.addEventListener('submit', sendMessage, true);