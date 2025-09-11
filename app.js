const form = document.querySelector(".login");
const statusEl = document.getElementById("status");
const uploadPost = document.querySelector(".submit-btn");
const saveblogUrl = 'http://localhost:8080/api/v1/blog/saveblogpost';
const loginUrl = "http://localhost:8080/api/v1/users/auth/login";
const getAllBlogPostUrl = 'http://localhost:8080/api/v1/blog/getallblogpost'
const createUser = "http://localhost:8080/api/v1/users/createuser"

form.addEventListener("submit", async(event) => {
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

        if(!res.ok) throw new Error(`Login failed: ${res.status}`);
        
        const { accessToken, username } = await res.json();
        if(!accessToken) throw new Error("Intet token i respons");

        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("username", username);
        console.log(accessToken);


    if(sessionStorage.getItem("accessToken") != null) {
        console.log(document.querySelector(".navPanel"));
        document.querySelector(".nav-panel").innerHTML = `Welcome to my page ${getUsernameByToken()}`;
        const test = document.querySelector(".nav-panel");
        test.classList.add("nav-panelLoggedin");
    }
    }  catch (err) {
        console.log(err);
    }
});

function getToken() {
    return sessionStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return sessionStorage.getItem("username");
}


    const container = document.getElementById('blog-posts-container');
    var date = new Date().toISOString().slice(0,10);

    function createBlogBox(blog) {
        return `
    <div class="blog-section">
        <div class="blog-box">
            <div class="blog-userInfo-logo">
                <img src="images/${blog.userInfo?.imgPath || 'default.jpeg'}">
                <p>${blog.userInfo?.name || 'Unknown'}</p>
            </div>
            <div class="blog-post-subject">
                <h2>${blog.subject}</h2>
                <p>${blog.publishDate}</p>
            </div>
            <div class="blog-post-body">
                <p>${blog.body}</p>
            </div>
            <div class="blog-interaction">
                <div class="blog-likes-section">
                    <ul>
                        <li><a href="#" class="interaction">like</a></li>
                        <li><a href="#" class="interaction">comment</a></li>
                        <li><a href="#" class="interaction">share</a></li>
                    </ul>
                </div>
                <div class="blog-see-all-comments">
                    <p>this is a comment</p>
                    <p>this is a comment</p>
                    <p>this is a comment</p>
                </div>
                <div class="blog-add-comments">
                    <label>
                        <input type="text" placeholder="Add a comment here">
                    </label>
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
        })
        .catch(err => {
            container.innerHTML = `<p>Failed to load blog posts ${err}.</p>`;
            console.error(err);
        });

    document.querySelector(".btn").addEventListener("click", function(){
        document.querySelector(".popup").classList.add("active");
    });
    document.querySelector(".popup .close-btn").addEventListener("click", function(){
        document.querySelector(".popup").classList.remove("active");
    });



    function submitForm() {

        const formEl = document.querySelector('.createblogpost');

        formEl.addEventListener('submit', event => {
            event.preventDefault();

            const token = getToken()
            if(!token) throw new Error("Du er ikke logget ind")
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


submitForm();
