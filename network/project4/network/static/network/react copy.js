const App = () => {
    const [currentView, setCurrentView] = React.useState("all_posts"); // State for the current view

    const renderContent = () => {
        switch (currentView) {
            case "all_posts":
                return <PostList fetchUrl="/all_posts/" />;
            case "following":
                return <PostList fetchUrl="/api/following_posts/" />;
            default:
                return <PostList fetchUrl="/all_posts/" />;
        }
    };
    return (
        <div>
            <nav>
                {/* <button onClick={() => setCurrentView("all_posts")}>All Posts</button>
                <button onClick={() => setCurrentView("following")}>Following</button> */}
            </nav>
            <main>{renderContent()}</main>
        </div>
    );
};


const PostList = ({ fetchUrl }) => {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    
    React.useEffect(() => {
        // Fetch all posts from the backend
        const fetchPosts = async () => {
        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error("Failed to load posts.");
            }
            const data = await response.json();
            setPosts(data.posts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };
        fetchPosts();
    }, [fetchUrl]);
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;


const handleProfileClick = (e, username) => {
    e.preventDefault(); // Prevent default anchor tag navigation
    const currentUser = document.getElementById("current_user").dataset.username;
    ReactDOM.render(
        <ProfilePage username={username} currentUser={currentUser} />,
        document.getElementById("profile-container") // Replace the current content
    );
};

const handleViewAll = () => {
    ReactDOM.render(
        <PostList fetchUrl="/all_posts/" />,
        document.getElementById("root")
    );
};

const handleViewFollowing = () => {
    ReactDOM.render(
        <PostList fetchUrl="/api/following_posts/" />,
        document.getElementById("root")
    );
};

return (
    <div className="post-list">
        {posts.map((post) => (
            <div key={post.id} className="post">
                <a href="#" onClick={(e) => handleProfileClick(e, post.user)}>
                    <h3>{post.user}</h3>
                </a>
                <p>{post.content}</p>
                <p>{post.timestamp}</p>
                <p><strong>Likes:</strong> {post.likes}</p>
                <hr />
            </div>
        ))}
    </div>
);
};



// ReactDOM.render(<PostList />, document.getElementById("root"));


function ProfilePage({ username, currentUser }) {
    const [profileData, setProfileData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#root').style.display = 'none';
    document.querySelector('#page_heading').style.display = 'none';
    document.querySelector('#profile-container').style.display = 'block';

    React.useEffect(() => {
        fetch(`api/profile/${username}/`)
            .then((response) => response.json())
            .then((data) => {
                setProfileData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching profile data:", error);
                setIsLoading(false);
            });
    }, [username]);

    const toggleFollow = () => {
        fetch(`/api/toggle_follow/${username}/`, {
            method: "POST",
            headers: { "X-CSRFToken": getCSRFToken(), "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                setProfileData((prev) => ({ ...prev, is_following: data.is_following }));
            })
            .catch((error) => console.error("Error toggling follow:", error));
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!profileData) {
        return <p>Profile not found.</p>;
    }

    const { followers, following, posts, is_following } = profileData;

    return (
        <div>
            <h1>{username}'s Profile</h1>
            <p>{followers} followers</p>
            <p>{following} following</p>

            {currentUser !== username && (
                <button onClick={toggleFollow}>
                    {is_following ? "Unfollow" : "Follow"}
                </button>
            )}

            <h2>Posts</h2>
            <ul>
                {posts.map((post, index) => (
                    <li key={index}>
                        <p>{post.content}</p>
                        <small>{new Date(post.timestamp).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Utility to get CSRF token (if needed)
function getCSRFToken() {
    return document.cookie.split("; ").find((row) => row.startsWith("csrftoken="));//?.split("=")[1];
}

  function new_post() {
      const content = document.querySelector('#post_content').value;
    
      fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            content: content
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
  
          document.querySelector('#post_content').value = '';
    
          // Once the email has been sent, load the user’s sent mailbox.
          // load_mailbox('sent');
      });
  };

//document.addEventListener('DOMContentLoaded', function() {
console.log(document.getElementById('view_following'));

// By default, load all posts
// load_all_posts();
console.log("DOM loaded");
// Disable form default
document.querySelector('#new_post_form').onsubmit = () => {
    new_post(); 
    return false;
}

// if (viewAllButton) {
//     viewAllButton.addEventListener("click", () => {
//         ReactDOM.render(
//             <PostList fetchUrl="/all_posts/" />,
//             document.getElementById("root")
//         );
//     });
// }


//if (viewFollowingButton) {
document.getElementById('view_following').addEventListener("click", () => {
    setCurrentView("following");
});

//}

//);

// Render the root component
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
