import React from 'react'

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-gray-200 mt-16">
			<div className="px-5 lg:px-20 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				<div>
					<h2 className="text-xl font-semibold mb-3">Ecommerce</h2>
					<p className="text-sm text-gray-400">Quality products curated for you. Fast shipping, easy returns, secure checkout.</p>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3">Shop</h3>
					<ul className="space-y-2 text-sm text-gray-300">
						<li><a href="/products?category=women_tops" className="hover:text-white">Women</a></li>
						<li><a href="/products?category=mens_jeans" className="hover:text-white">Men</a></li>
						<li><a href="/products" className="hover:text-white">All Products</a></li>
						<li><a href="#" className="hover:text-white">New Arrivals</a></li>
					</ul>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3">Support</h3>
					<ul className="space-y-2 text-sm text-gray-300">
						<li><a href="#" className="hover:text-white">Help Center</a></li>
						<li><a href="#" className="hover:text-white">Shipping & Returns</a></li>
						<li><a href="#" className="hover:text-white">Order Status</a></li>
						<li><a href="#" className="hover:text-white">FAQs</a></li>
					</ul>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
					<p className="text-sm text-gray-400 mb-3">Join our newsletter for exclusive offers and updates.</p>
					<form className="flex flex-col sm:flex-row gap-2">
						<input
							type="email"
							placeholder="Your email"
							className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="button"
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>

			<div className="border-t border-gray-800 px-5 lg:px-20 py-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
				<p>© {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
				<div className="flex gap-4 mt-2 sm:mt-0">
					<a href="#" className="hover:text-white">Privacy</a>
					<a href="#" className="hover:text-white">Terms</a>
					<a href="#" className="hover:text-white">Contact</a>
				</div>
			</div>
		</footer>
	)
}

export default Footer
