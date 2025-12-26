import React from 'react'

const HomeSectionCard = ({ productName, productDescription, productImage, productPrice, onClick }) => {
  return (
    <div className='cursor-pointer flex flex-col items-center justify-center p-4 m-2 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'>
        
        <div className='w-full h-48 mb-4 bg-gray-100 flex items-center justify-center'>
            {productImage ? (
              <img className='object-cover object-top w-full h-full'
                  src={productImage} 
                  alt={productName}
              />
            ) : (
              <div className='text-center text-gray-400'>
                <svg className='w-16 h-16 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
                <p className='text-sm'>No Image</p>
              </div>
            )}
        </div>
        <div className='p-4 w-full'>
          <h3 className='text-lg font-medium text-gray-800 mb-2'>{productName || "Product Name"}</h3>
          <p className='text-sm text-gray-600 mb-3'>{productDescription || "Product description goes here"}</p>
          <p className='text-lg font-bold text-blue-600'>Rs. {productPrice || "0.00"}</p>
          <button onClick={onClick} className='mt-3 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50'>View More Similar</button>
        </div>
    </div>
  )
}

export default HomeSectionCard
