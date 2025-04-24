import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/userSlice";
import { fetchUsers } from "../redux/api";

const UserList = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  useEffect(() => {
    const getUsers = async () => {
      const data = await fetchUsers();
      dispatch(setUsers(data)); // ✅ Dispatch users to Redux
    };
    getUsers();
  }, [dispatch]);

  console.log("Users in Redux Store:", users); // ✅ Check Redux state

  return (
    <div>
      <h2>User List</h2>
      {users.length === 0 ? <p>No users found</p> : users.map((user) => <p key={user._id}>{user.name}</p>)}
    </div>
  );
};

export default UserList;
