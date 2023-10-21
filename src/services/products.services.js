import ProductDTO from "../DTO/products.dto.js";

export default class ProductRepository {
  constructor(productDAO, userDAO) {
    this.productDAO = productDAO;
    this.userDAO = userDAO;
  }
  async addProduct(data) {
    try {
      const productExist = await this.productDAO.getProductByCode(data.code);
      if (productExist) {
        throw new Error("Product already exist");
      }
      const product = await this.productDAO.addProduct(data);
      return product;
    } catch (error) {
      throw error;
    }
  }
  async getProducts() {
    try {
      const products = await this.productDAO.getProducts();
      return products;
    } catch (error) {
      throw error;
    }
  }
  async getProductById(id) {
    try {
      const product = await this.productDAO.getProductById(id);
      return product;
    } catch (error) {
      throw error;
    }
  }
  async updateProduct(id, data) {
    try {
      const product = await this.productDAO.updateProduct(id, data);
      return new ProductDTO(product);
    } catch (error) {
      throw error;
    }
  }
  async deleteProduct(id) {
    try {
      const product = await this.productDAO.deleteProduct(id);
      return new ProductDTO(product);
    } catch (error) {
      throw error;
    }
  }

  async getProductsPaginate(page, limit, queryParams, sort) {
    try {
      const products = await this.productDAO.getProductsPaginate(
        page,
        limit,
        queryParams,
        sort
      );
      const productsPrev = products.productsPrev;
      const productsNext = products.productsNext;
      const parametrosAnterior = new URLSearchParams(productsPrev);
      const paginaAnterior = parametrosAnterior.get("page");
      const parametrosPosterior = new URLSearchParams(productsNext);
      const paginaSiguiente = parametrosPosterior.get("page");
      let productsPaginate = products.productsPaginate;
      productsPaginate = productsPaginate.filter(
        (product) => product.stock > 0
      );
      return {
        productsPaginate,
        productsPrev,
        productsNext,
        paginaAnterior,
        paginaSiguiente,
      };
    } catch (e) {
      throw e;
    }
  }

  async getProductsLimit(limit) {
    try {
      const products = await this.productDAO.getProductsLimit(limit);
      return products.map((product) => new ProductDTO(product));
    } catch (error) {
      throw error;
    }
  }
}
