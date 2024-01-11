import Property from "../models/property.js";
import Room from "../models/room.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import Location from "../models/location.js";
import fs from "fs";
import Order from "../models/order.js";

const attributesChosen = [
  "id",
  "name",
  "description",
  "image_url",
  "categoryId",
];


Property.sync();
Room.sync();
User.sync();
export const getPropertyData = async (req, res) => {
  try {
    console.log("Get Property Data");
    const userId = req.user;
    const result = await Property.findAll({
      attributes: attributesChosen,
      include: [{ model: Category, as: "category" }],
      where: { userId: userId },
    });
    return res.status(200).send({
      message: "Property Data Succesfully Retrieved",
      data: result,
    });
  } catch (err) {
    return res.send({
      message: err.message,
    });
  }
};

export const postPropertyData = async (req, res) => {
  try {
    const { name, description, categoryId, location } = req.body;

    const propLocation = await Location.findOne({ where: { city: location } });
    const userId = req.user;
 
    const imageURL = `${process.env.SERVER_LINK}/${req.file.filename}`;
    const result = await Property.create({
      name: name,
      description: description,
      image_url: imageURL,
      categoryId: categoryId,
      userId: userId,
      locationId: propLocation.id,
    });

    return res.status(202).send({
      message: "Property Data Succesfully Posted",
      data: result,
    });
  } catch (err) {
    return res.send({
      message: err.message,
    });
  }
};

export const editPropertyData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("PropertyEdit Server :", id);
    const { name, description, categoryId, location } = req.body;
    const propLocation = await Location.findOne({ where: { city: location } });
    const property = await Property.findByPk(id);
    const path = property.image_url.substring(22);
    fs.unlink(`public/${path}`, (err) => {
      if (err) console.log(err);
    });

    const imageURL = `${process.env.SERVER_LINK}/${req.file.filename}`;
    console.log(req.body);

    await Property.update(
      {
        name: name,
        description: description,
        image_url: imageURL,
        categoryId: categoryId,
        locationId: propLocation.id,
      },
      { where: { id: id } }
    );

    return res.status(203).send({
      message: "Property Data Succesfully Updated",
    });
  } catch (err) {
    return res.send({
      message: err.message,
    });
  }
};

export const deletePropertyData = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    const rooms = await Room.findAll({
      attributes: ["id", "image_url"],
      where: { propertyId: id },
    });
    console.log("hai")
    const allOrders = [];

    for (const room of rooms) {
      const orders = await Order.findAll({ where: { roomId: room.id } });
  
      allOrders.push(...orders);
    }
   
    if (allOrders.length === 0){
    //Deleting Property Image
    const path = property.image_url.substring(22);
    fs.unlink(`public/${path}`, (err) => {
      if (err) console.log(err);
    });
    console.log("Property File Deleted");
    //Deleting Room Images
    rooms.forEach((value) => {
      const pathRoom = value.dataValues.image_url.substring(22);
      fs.unlink(`public/${pathRoom}`, (err) => {
        if (err) console.log(err);
      });
    });
    console.log("Room File deleted");

    await Property.destroy({
      where: {
        id: id,
      },
      include: [{ model: Room, where: { propertyId: id } }],
    });

    return res.status(204).send({
      message: "Property Data Succesfully Deleted",
    });}
    else 
    {
      return res.status(500).send({
        message: "Property Data Cannot Be Deleted, There are Orders Associated with the property",
      });}
  
  } catch (err) {
    return res.send({
      message: err.message,
    });
  }
};
