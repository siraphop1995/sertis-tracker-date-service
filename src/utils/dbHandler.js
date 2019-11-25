const axios = require('axios');
const { USER_SERVER, LINE_SERVER } = process.env;

getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user.map(user => {
    return {
      _id: user._id,
      lid: user.lid,
      uid: user.uid
    };
  });
};

getFullUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user;
};

findUser = async userId => {
  return (
    await axios.post(`${USER_SERVER}/findUser`, {
      uid: userId
    })
  ).data.user;
};

module.exports = {
  getUserList,
  findUser,
  getFullUserList
};
