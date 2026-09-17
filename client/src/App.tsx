import PullRequestDetails from "./pages/PullRequestDetails";

function App() {
  return (
    <PullRequestDetails
      onBack={() => {
        window.history.back();
      }}
    />
  );
}

export default App;