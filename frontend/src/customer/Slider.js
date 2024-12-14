import React, { useState, useEffect } from "react";
import "./Home.css";
import slide1 from './first.jpg';
import slide2 from './second.jpg';

const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: slide1, text: "Welcome to Our Homepage" },
        { image: slide2, text: "Discover Our Amazing Products" },
    ];

    // Auto-slide functionality
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000); // Change slide every 10 seconds

        return () => clearInterval(slideInterval); // Cleanup on unmount
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    return (
        <div className="slider-container">
            <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                <div className="slide">
                    <img src={slide1} alt="First Slide" />
                </div>
                <div className="slide">
                    <img src={slide2} alt="Second Slide" />
                </div>
            </div>
            <button className="prev" onClick={prevSlide}>
                ❮
            </button>
            <button className="next" onClick={nextSlide}>
                ❯
            </button>
        </div>
    );
};

export default Slider;