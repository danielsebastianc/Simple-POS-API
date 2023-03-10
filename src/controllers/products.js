const { Op } = require("sequelize");
const { ProductsModel, CategoriesModel } = require("../models");

module.exports = {
  paginate: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 5;
      const offset = limit * page;

      const { name, category, sortby } = req.query;
      const order = req.query.order || "asc";
      const filterData = [];
      const sortData = [];

      if (name) {
        filterData.push({
          name: {
            [Op.like]: "%" + name + "%",
          },
        });
      }
      if (category) {
        filterData.push({
          idcategories: category,
        });
      }

      if (sortby) {
        sortData.push([sortby, order]);
      } else {
        sortData.push(["idproducts", "DESC"]);
      }

      const data = await ProductsModel.findAndCountAll({
        include: {
          model: CategoriesModel,
          as: "category",
          required: true,
          attributes: ["idcategories", "name"],
        },
        where: {
          [Op.and]: filterData,
        },
        offset: offset,
        limit: limit,
        order: sortData,
      });

      const totalPage = Math.ceil(data.count / limit);

      return res.status(200).send({
        data: data.rows,
        page,
        limit,
        totalRows: data.count,
        totalPage,
      });
    } catch (error) {
      console.log(error);
    }
  },
  getData: async (req, res) => {
    try {
      const { name, category, sortby } = req.query;
      const order = req.query.order || "asc";
      const filterData = [];
      const sortData = [];
      if (name) {
        filterData.push({
          name: {
            [Op.like]: "%" + name + "%",
          },
        });
      }
      if (category) {
        filterData.push({
          idcategories: category,
        });
      }

      if (sortby) {
        sortData.push([sortby, order]);
      }

      const result = await ProductsModel.findAndCountAll({
        include: {
          model: CategoriesModel,
          as: "category",
          required: true,
          attributes: ["idcategories", "name"],
        },
        where: {
          [Op.and]: filterData,
        },
        order: sortData,
      });
      if (result.count > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: `Data Not Found`,
          data: [],
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  regis: async (req, res) => {
    try {
      const pathName = req.files[0].destination.split("/");
      const productImg = `/${pathName[pathName.length - 1]}/${req.files[0].filename}`;

      const newBody = { ...req.body, productImg };
      const checkData = await ProductsModel.findAll({
        where: {
          name: req.body.name,
        },
      });
      if (checkData.length > 0) {
        return res.status(500).send({
          success: false,
          message: `Product already exist`,
        });
      } else {
        const data = await ProductsModel.create(newBody);
        return res.status(200).send({
          success: true,
          message: `New Product Added`,
          data,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  update: async (req, res) => {
    try {
      let newBody = { ...req.body };
      if (req.files != undefined) {
        const pathName = req.files[0].destination.split("/");
        const productImg = `/${pathName[pathName.length - 1]}/${req.files[0].filename}`;
        newBody = { ...req.body, productImg };
      }

      let update = await ProductsModel.update(newBody, {
        where: {
          idproducts: req.params.idproducts,
        },
      });
      if (update) {
        return res.status(200).send({
          success: true,
          message: `Data Updated Successfully`,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
};
