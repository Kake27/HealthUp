


const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Welcome to the Appointment System</h1>
      <button onClick={() => navigate("/signup-doctor")} style={{ margin: "10px", padding: "10px 20px" }}>
        Sign up as Doctor
      </button>
      <button onClick={() => navigate("/signup-patient")} style={{ margin: "10px", padding: "10px 20px" }}>
        Sign up as Patient
      </button>
    </div>
  );
};
