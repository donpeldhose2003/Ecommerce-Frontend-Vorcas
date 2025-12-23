import React from 'react'

const HomeSectionCard = ({ productName, productDescription, productImage, productPrice, onClick }) => {
  return (
    <div className='cursor-pointer flex flex-col items-center justify-center p-4 m-2 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'>
        
        <div className='w-full h-48 mb-4'>
            <img className='object-cover object-top w-full h-full'
                src={productImage || "/summer.avif"} 
                alt={productName}
            />
        </div>
        <div className='p-4 w-full'>
          <h3 className='text-lg font-medium text-gray-800 mb-2'>{productName || "Product Name"}</h3>
          <p className='text-sm text-gray-600 mb-3'>{productDescription || "Product description goes here"}</p>
          <p className='text-lg font-bold text-blue-600'>${productPrice || "0.00"}</p>
          <button onClick={onClick} className='mt-3 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50'>View More Similar</button>
        </div>
    </div>
  )
}

export default HomeSectionCard
