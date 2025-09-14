

function createUserprofileBlogBox(blog) {
    return `

                <article class="post">
                    <header class="post-header">
                        <h2 class="post-title"> ${blog.subject} </h2>
                        <time class="post-date" datetime="${blog.publishDate}"> dato </time>
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
                        <div class="post-comments">
                            <p class="comment">this is a comment</p>
                            <p class="comment">this is a comment</p>
                            <p class="comment">this is a comment</p>
                        </div>

                        <form class="post-add-comment">
                            <label class="sr-only" for="comment-input-1"></label>
                            <input id="comment-input-1" type="text" placeholder="Add a comment…" />
                            <button class="btn">Send</button>
                        </form>
                    </footer>
                </article>
            </div>
            `;
}

fetch("http://localhost:8080/api/v1/users/test")
    .then(res => res.json())
    .then(data => {
        userprofilecontainer.innerHTML = data.map(createUserprofileBlogBox).join('');
    })
    .catch(err => {
        container.innerHTML = '<p>Failed to load blog posts.</p>';
        console.error(err);
    });
    