import FileManager from './FileManager.js'

export default class CartManager extends FileManager {
    
    constructor() {
        super('./database/carts.json')
    }

    //Crea un nuevo carrito y lo agrega a la lista de carritos existentes
    createCart = async () => {
        try{
            const cart = await this.get()
            const lastCart = (cart.length !== 0) ? cart[cart.length-1].id+1 :1
            const data = {
                id: lastCart,
                products: []
            }
            cart.push(data)
            return await this.set(cart)
        } catch (error) {
            console.error("Cart not created")
            throw error
        }   
    }

    //Agrega productos a un carrito
    addProduct = async (cid,pid,quantity) => {
        const cart = await this.getCart(cid)
        try{
            if(!cart) throw "Cart not exist"
            const productIn= cart.products.findIndex(p => p.id == pid)
            if(productIn !== -1) {
                cart.products[productIn].quantity += quantity 
            } else{
                cart.products.push({
                    id: pid,
                    quantity
            })
            
            return await this.update([cart])
            }
        } catch(error){
            return "Error"
        }

    }

    //Obtiene un carrito existente
    getCart = async (cid) => {
        const cart = await this.get()
        try{
            const cartId = cart.find(c => c.id === cid)
            return cartId
        } catch(error){
            return "Error"
        }
    }
}
