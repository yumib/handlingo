interface UserAttr {
  UserRank: number;
  UserXP: number;
}

interface GlobalUser extends UserAttr {
  UserName: string;
}

interface GlobalUsersData {
  Users: GlobalUser[];
}

const dummyData = (): GlobalUsersData => {
  const userNumber = 30;
  const users: GlobalUser[] = [];

  for (let i = 0; i < userNumber; i++)
    users.push({
      UserName: `User ${i + 1}`,
      UserRank: (i + 1) * 10,
      UserXP: (i + 1) * 100,
    });

  const returnData: GlobalUsersData = {
    Users: users,
  };

  return returnData;
};

// component for the top which would display the user's information under "Your stats"
const UserStats = (props: UserAttr) => {
  return (
    <>
      <h2 className="text-2xl mb-4 w-1/6">Your Stats</h2>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        <p>👑 Rank</p> <p>{props.UserRank}</p>
        <p>✨ XP</p> <p>{props.UserXP}</p>
      </div>
    </>
  );
};

// table where each user will be displayed by rows in a table (so here..
// we would call the top component, GlobalUserRow)
const GlobalUsersTable = (props: GlobalUsersData) => {
  return (
    <>
      <h2 className="text-2xl mt-10 mb-4">Leaderboard</h2>

      <table className="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Rank</th>
            <th className="border border-gray-300 px-4 py-2">User</th>
            <th className="border border-gray-300 px-4 py-2">XP</th>
          </tr>
        </thead>
        <tbody>
          {props.Users.map((user, key) => (
            <tr key={key}>
              <td className="border border-gray-300 px-4 py-2">
                {user.UserRank}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.UserName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.UserXP}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const Leaderboard = () => {
  return (
    <>
      <UserStats UserRank={50} UserXP={5000} />
      <GlobalUsersTable Users={dummyData().Users} />
    </>
  );
};

export default Leaderboard;
