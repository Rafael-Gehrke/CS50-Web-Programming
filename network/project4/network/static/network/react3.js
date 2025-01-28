
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
                <button onClick={() => setCurrentView("all_posts")}>All Posts</button>
                <button onClick={() => setCurrentView("following")}>Following</button>
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
        const fetchPosts = async () => {
            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) {
                    throw new Error("Failed to load posts.");
                }
                const data = await response.json();
                setPosts(data.posts || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [fetchUrl]); // Refetch posts if fetchUrl changes

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {posts.map((post) => (
                <div key={post.id} className="post">
                    <h3>{post.user}</h3>
                    <p>{post.content}</p>
                    <p>{post.timestamp}</p>
                    <p><strong>Likes:</strong> {post.likes}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
};

// Render the root component
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

