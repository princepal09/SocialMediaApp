const RegisterUserForm = () => {
  return (
    <div>
      <form>
        <div>
          <label>Username</label>
          <input type="text" />
        </div>

        <div>
          <label>Email</label>
          <input type="text" />
        </div>

        <div>
          <label>Password</label>
          <input type="text" />
        </div>
        <div>
          <label>Profile Picture</label>
          <input type="text" />
        </div>
        
        <button>Register</button>
      </form>
    </div>
  );
};

export default RegisterUserForm;
