import React from 'react'
import HomeSectionCard from './HomeSectionCard'

const mensJeans = [
  {
    id: 1,
    productName: 'Classic Slim Fit Jeans',
    productDescription: 'Slim fit, stretch denim, indigo wash',
    productImage: '/OIP (1).webp',
    productPrice: '39.99'
  },
  {
    id: 2,
    productName: 'Relaxed Straight Jeans',
    productDescription: 'Relaxed fit, durable fabric, dark wash',
    productImage: '/download.webp',
    productPrice: '34.99'
  },
  {
    id: 3,
    productName: 'Tapered Fit Jeans',
    productDescription: 'Tapered leg, soft cotton blend, black',
    productImage: '/OIP (2).webp',
    productPrice: '44.99'
  },
  {
    id: 4,
    productName: 'Light Wash Jeans',
    productDescription: 'Comfort fit, light blue wash',
    productImage: '/OIP (3).webp',
    productPrice: '36.99'
  },
  {
    id: 5,
    productName: 'Vintage Blue Jeans',
    productDescription: 'Vintage style, classic blue',
    productImage: '/OIP (4).webp',
    productPrice: '42.99'
  },
  {
    id: 6,
    productName: 'Premium Stretch Jeans',
    productDescription: 'Comfort stretch, mid-rise, modern fit',
    productImage: '/633e5c862500003e00566718.webp',
    productPrice: '49.99'
  },
]

const HomeSectionCarosel = ({ products = mensJeans, title = "Men's Jeans" }) => {
  return (
    <div className='px-5 lg:px-20 py-10'>
      <h2 className='text-2xl font-bold text-gray-800 mb-8'>{title}</h2>
      
      {products && products.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {products.map((product) => (
            <HomeSectionCard
              key={product.id}
              productName={product.productName}
              productDescription={product.productDescription}
              productImage={product.productImage}
              productPrice={product.productPrice}
              onClick={() => alert(`Viewing similar items for ${product.productName}`)}
            />
          ))}
        </div>
      ) : (
        <p className='text-gray-600'>No products available</p>
      )}
    </div>
  )
}

export default HomeSectionCarosel