"use client"

import { useEffect, useState } from "react"

type Product = {
  id: number
  name: string
  description: string
  price: number
  stock: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <main style={{ padding: "40px" }}>
      <h1>Zaria Products</h1>

      {products.length === 0 && <p>No products found</p>}

      {products.map(product => (
        <div key={product.id} style={{
          marginBottom: "20px",
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px"
        }}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </main>
  )
}
