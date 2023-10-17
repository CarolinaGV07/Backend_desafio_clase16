import FileManager from './FileManager.js'

export default class ProductManager extends FileManager{
    constructor () {  
        super('./database/database.json') 
    }

    //Agrega un nuevo producto
    createProduct = async ({title, description,code,price,status,stock, category,thumbnail}) => {
        
        try{
            if(!title || !description || !code || !price || !status || !stock || !category){
                return (false, "All fields must be completed")
            }
    /*
            if(typeof thumbnail !== 'object'){
                return false
            }
    */        
    
            const products = await this.listProducts()
            const invalidCode = products.some(prod => prod.code === code)
            if(invalidCode){
                return "Code entered has already been used"
            }
    
            const product = {title, description, code, price, status: true , stock, category, thumbnail , id: await this.getId()}
    
            const list = await this.listProducts()
            list.push(product)
            const result = await this.set(list)
            return (result, "Product created correctly")
        } catch (error){
            return "Error"
        }

    }
    //Obtiene todos los productos
    listProducts = async () => {
        try{
            const result = await this.get()
            return result
        } catch (error) {
            return ([],"File not found")
             
        }
    }
    //Obtiene un producto por ID
    getProductById = async (productId) => {

        const dateId = await this.listProducts()
        try{
            const findProduct = dateId.find((prod) => prod.id === productId);
            if(findProduct){
                return findProduct
            } else {
                return "Not found"
            }
        } catch (error){
            return "Error"
        }

    }

    //Actualiza un producto por ID
    updateProduct = async (id,productObj) => {
        const upProd = await this.listProducts()
        try{
            const productIndex = upProd.findIndex((prod) => prod.id === id)
            if(!productIndex === -1){
                return "Product not updated"
            }
            const updateProducts = upProd.map((product) =>{
                if(product.id===id){
                    return {...product,...productObj}
                }
                    return product
            })
            const result = await this.update(updateProducts)
            return (result, "Register updated successfully")
        } catch (error){
            return "Error"
        }

    }

    //Elimina un producto por ID
    deleteProduct = async (productId) => {

        const delProd = await this.listProducts()
        try{
            const prodExist = delProd.findIndex((prod) => prod.id === productId)
            if(prodExist === -1){
                return "Product doesn`t exist"
            }
    
            const deleteProduct = delProd.filter((prod) => prod.id !== productId)
    
            const result = await this.delete(deleteProduct)
            return (result, "Register deleted successfully")
        } catch (error){
            return "Error"
        }

    }
}