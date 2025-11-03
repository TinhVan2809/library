import { useState, useEffect } from 'react';

function Footer() {
    const [isVisible, setIsVisible] = useState(false);

    // Function to scroll to the top of the page smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Effect to handle showing/hiding the button based on scroll position
    useEffect(() => {
        // Function to check scroll position
        const toggleVisibility = () => {
            // If page is scrolled more than 300px, show the button
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Add scroll event listener when the component mounts
        window.addEventListener('scroll', toggleVisibility);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []); // The empty dependency array ensures this effect runs only once on mount and cleanup on unmount

    return (
        <>
            <footer>
                <div className="content-left">
                    <div className="content left">
                        <p>Helpful Links</p>
                        <a href="javaScript:void(0)">Term & Conditions</a>
                        <a href="javaScript:void(0)">Privacy Policy</a>
                        <a href="javaScript:void(0)">Refund Policy</a>
                        <a href="javaScript:void(0)">Shipping Policy</a>
                        <a href="javaScript:void(0)">Cookie Policy</a>
                    </div>
                    <div className="content right">
                        <p>Contact</p>
                        <a href="javaScript:void(0)">Tinhvan@tdu@edu.vn</a>
                        <a href="javaScript:void(0)">Belgium</a>
                        <button>Collab</button>
                        <span><i className="ri-instagram-line"></i> <i className="ri-tiktok-fill"></i></span>
                    </div>
                </div>

                <div className="content-right">
                    <h1>LIBRARY NETWORD</h1>
                    <p>©coppyright. Mọi khiếu nại bản quyền, vui lòng liên hệ <a href="javaScript:void(0)" style={{textDecoration: 'none', color: '#000', fontWeight: '550'}}>Tại đây</a></p>
                    <p>Tham gia cộng đồng của chúng tôi qua <a href="javaScript:void(0)" style={{textDecoration: 'none', color: '#000', fontWeight: '550'}}>Discord <i className="ri-discord-fill"></i></a></p>
                    
                    {isVisible && (
                        <button onClick={scrollToTop}>
                            <div className="text">
                                <span>Back</span>
                                <span>to</span>
                                <span>top</span>
                            </div>
                            <div className="clone">
                                <span>Back</span>
                                <span>to</span>
                                <span>top</span>
                            </div>
                            <svg
                                stroke-width="2"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                fill="none"
                                class="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20px"
                            >
                                <path
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                ></path>
                            </svg>
                        </button>
                    )}
                </div>
            </footer>
        </>
    )
}

export default Footer;