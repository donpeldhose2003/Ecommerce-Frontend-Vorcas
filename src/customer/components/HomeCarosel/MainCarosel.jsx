import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { homeCarouselData } from './MainCaroselData';

const responsive = {
    0: { items: 1 },
    568: { items: 2 },
    1024: { items: 3 },
};

const MainCarosel = () => {
    //const navigate=useNavigate();
    const items = homeCarouselData.map((item) => (
        <div key={item.path} className='w-full h-64 sm:h-80 md:h-96 lg:h-screen'>
            <img 
                className='w-full h-full object-cover cursor-pointer' 
                role='presentation' 
                src={item.image}
                alt="carousel"
            />
        </div>
    ))
return (
    <div className='w-full'>
        <AliceCarousel
            items={items}
            disableButtonsControls
            autoPlay
            autoPlayInterval={2000}
            infinite
        />
    </div>
)
}


export default MainCarosel;