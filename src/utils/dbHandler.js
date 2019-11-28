const axios = require('axios');
const { USER_SERVER, LINE_SERVER } = process.env;

/**
 * API request to USER_SERVER, will map data
 * GET
 *   /getAllUsers
 *      @return {Object} User data object
 */
getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user.map(user => {
    return {
      _id: user._id,
      lid: user.lid,
      uid: user.uid
    };
  });
};

/**
 * API request to USER_SERVER
 * GET
 *   /getAllUsers
 *      @return {Object} User data object
 */
getFullUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user;
};

/**
 * API request to USER_SERVER
 * POST
 *   /findUser
 *      @param userId {string} User uid.
 *      @return {Object} User data object
 */
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
