import User from "../../models/user.js";
import Role from "../../models/role.js";

User.belongsTo(Role);
export default class Users {
  async findAllUser(params) {
    const result = await User.findAll(params);
    return result;
  }

  async findOneUser(params) {
    const result = await User.findOne(params);
    return result;
  }

  async insertOneUser(data) {
    const result = await User.create(data);
    return result;
  }

  async updateOneUser(data, params) {
    const result = await User.update(data, params);
    return result;
  }
}
