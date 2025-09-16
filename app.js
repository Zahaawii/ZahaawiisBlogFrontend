const form = document.querySelector(".login");
const statusEl = document.getElementById("status");
const uploadPost = document.querySelector(".submit-btn");
const saveblogUrl = 'http://localhost:8080/api/v1/blog/saveblogpost';
const loginUrl = "http://localhost:8080/api/v1/users/auth/login";
const getAllBlogPostUrl = 'http://localhost:8080/api/v1/blog/getallblogpost'
const createUser = "http://localhost:8080/api/v1/users/createuser"
const findCommentsUrl = "http://localhost:8080/api/v1/comments/getcomment/"
const addCommentsUrl = "http://localhost:8080/api/v1/comments/addcomment"
const deleteCommentsUrl = "http://localhost:8080/api/v1/comments/delete/"

form.addEventListener("submit", async (event) => {
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

        if (!res.ok) throw new Error(`Login failed: ${res.status}`);

        const { accessToken, username } = await res.json();
        if (!accessToken) throw new Error("Intet token i respons");

        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("username", username);
        console.log(accessToken);


        if (sessionStorage.getItem("accessToken") != null) {
            console.log(document.querySelector(".navPanel"));
            document.querySelector(".nav-panel").innerHTML = `Welcome to my page ${getUsernameByToken()}`;
            const test = document.querySelector(".nav-panel");
            test.classList.add("nav-panelLoggedin");
        }
    } catch (err) {
        console.log(err);
    }
});

window.addEventListener("load", () => {
    const token = sessionStorage.getItem("accessToken");
    const name = sessionStorage.getItem("username");
    if (token) {
        console.log("User already logged in");
        document.querySelector(".nav-panel").innerHTML = `<a href="userprofile.html?id=${name}" target="_blank"> <img src="images/${name}.jpeg"></a>`;
    }
});


function getToken() {
    return sessionStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return sessionStorage.getItem("username");
}


const container = document.getElementById('blog-posts-container');
var date = new Date().toISOString().slice(0, 10);

function createBlogBox(blog) {
    return `
    <div class="blog-section" data-blog-id="${blog.blogId}">
        <div class="blog-box">
            <div class="blog-userInfo-logo">
                <a href="userprofile.html?id=${blog.author?.name}" target="_blank"> <img src="images/${blog.author?.imgPath || 'default.jpeg'}"></a>
                <p>${blog.author?.name || 'Unknown'}</p>
            </div>
            <div class="blog-post-subject">
                <h2>${blog.subject}</h2>
                <p>${blog.publishDate}</p>
            </div>
            <div class="blog-post-body">
                <pre>${blog.body}</pre>
            </div>
            <div class="blog-interaction">
                <div class="blog-likes-section">
                    <ul>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-thumbs-up"></i></a></li>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-comments"></i></a></li>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-share-from-square"></i></a></li>
                    </ul>
                </div>
                <div class="blog-see-all-comments"></div>
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
                </div>
            </div>
        </div>
    </div>
    `;
}

fetch(getAllBlogPostUrl)
    .then(res => res.json())
    .then(data => {
        container.innerHTML = data.map(createBlogBox).join('');

        document.querySelectorAll('.blog-section').forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.blog-see-all-comments');

            fetch(`${findCommentsUrl}${blogId}`)
                .then(res => res.json())
                .then(comments => {
                    if (!comments || comments.length === 0) {
                        commentsContainer.innerHTML = "";
                        return;
                    }
                    commentsContainer.innerHTML = comments
                        .map(c => `<p>${c.username}: <br> ${c.comment}<i onclick="deleteComment(${c.commentId})" style="cursor: pointer;" class="fa-solid fa-trash"></i></p>`)
                        .join('');
                        console.log(comments);
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

document.querySelector(".btn").addEventListener("click", function () {
    document.querySelector(".popup").classList.add("active");
});
document.querySelector(".popup .close-btn").addEventListener("click", function () {
    document.querySelector(".popup").classList.remove("active");
});

function deleteComment(id) {
    const token = getToken();
    fetch(deleteCommentsUrl + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(id)
    })
        .then(res => res.text())
        .then(data => {
            console.log("kommentar slettet: " + data)
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
            console.log("Kommentar tilføjes: ", data);
            input.value = "";
        })
        .catch(error => console.error("fejl ved kommentar: ", error));
}

function submitForm() {

    const formEl = document.querySelector('.createblogpost');

    formEl.addEventListener('submit', event => {
        event.preventDefault();

        const token = getToken()
        if (!token) throw new Error("Du er ikke logget ind")
        const formData = new FormData(formEl);
        formData.set('publishDate', date);
        const data = Object.fromEntries(formData);

        fetch(saveblogUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(error => console.log(error))
    });
};

