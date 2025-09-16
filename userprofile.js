const urlParameter = new URLSearchParams(location.search);
const username = urlParameter.get("id");
const userprofilBlogecontainer = document.getElementById('userprofilecontainer');
const userprofileInfo = document.getElementById('userprofileinfo');



function createUserprofileBlogBox(blog) {
    return `

                <article class="post" data-blog-id="${blog.blogId}">
                    <header class="post-header">
                        <h2 class="post-title"> ${blog.subject} </h2>
                        <time class="post-date"> ${blog.publishDate} </time>
                    </header>

                    <div class="post-body">
                        <p> ${blog.body} </p>
                    </div>
                    <footer class="post-footer">
                        <nav class="post-actions">
                            <button class="abtn btn-ghost"><i class="fa-regular fa-thumbs-up"></i></button>
                            <button class="abtn btn-ghost"><i class="fa-regular fa-comments"></i></button>
                            <button class="abtn btn-ghost"><i class="fa-regular fa-share-from-square"></i></button>
                        </nav>
                        <div class="post-comments"></div>

                        <form class="post-add-comment">
                            <label class="sr-only" for="comment-input-1"></label>
                            <input id="comment-input-1" type="text" placeholder="Add a comment…" />
                            <button class="btn">Send</button>
                        </form>
                    </footer>
                </article>
            
            `;
}

function createUserProfileBox(box) {
    return `
                <aside class="userprofile-sidebar">
                <img src="images/default.jpeg" alt="profile picture" class="userprofile-avatar">
                <h2 class="userprofile-name"> ${box.name} </h2>
                <p class="userprofile-bio">This is the user description</p>
                <p class="userprofile-joined">${box.createdDate}</p>

                <div class="userprofile-stats">
                    <div>
                        <span class="stat-label">Post</span>
                        <span class="stat-value"> 25 </span>
                    </div>
                    <div>
                        <span class="stat-label"> Test </span>
                        <span class="stat-value"> 25</span>
                    </div>
                    <div>
                        <span class="stat-label"> Test </span>
                        <span class="stat-value"> 25</span>
                    </div>    
                </div>
            </aside>
            `;
}

fetch("http://localhost:8080/api/v1/blog/getbyusername/" + username)
    .then(res => res.json())
    .then(data => {
        userprofilBlogecontainer.innerHTML = data.map(createUserprofileBlogBox).join('');
        document.querySelectorAll(`.post`).forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.post-comments');

            fetch(`http://localhost:8080/api/v1/comments/getcomment/${blogId}`)
            .then(res => res.json())
            .then(comments => {
                console.log(comments);
                if(!comments || comments.length === 0) {
                    commentsContainer.innerHTML = "";
                    return;
                }
                commentsContainer.innerHTML = comments
                .map(c => `<p>${c.comment}</p>`)
                .join('');
            })
            .catch(err => {
                commentsContainer.innerHTML = `<p> Could not load comments ${err}</p>`;
                console.error(err);
            });
        })
    })
    .catch(err => {
        userprofilBlogecontainer.innerHTML = '<p>Failed to load blog posts.</p>';
        console.error(err);
    });
    
    fetch("http://localhost:8080/api/v1/users/getuserbyname/" + username)
    .then(res => res.json())
    .then(user => {
           userprofileInfo.querySelector(".userprofile-sidebar")?.remove();

         userprofileInfo.insertAdjacentHTML("afterbegin", createUserProfileBox(user));
    })
    .catch(err => {
        userprofileInfo.innerHTML = '<p>User does not exist.</p>';
        console.error(err);
    });
    