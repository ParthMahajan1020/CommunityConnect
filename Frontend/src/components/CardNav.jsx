import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";

const CardNav = ({
    logo,
    logoAlt = "Logo",
    items = [],
    className = "",
    ease = "power3.out",
    baseColor = "#fff",
    menuColor = "#000",
    buttonBgColor = "#111",
    buttonTextColor = "#fff",
    onNavigate,
    onLogout
}) => {
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const navRef = useRef(null);
    const cardsRef = useRef([]);
    const tlRef = useRef(null);

    /*
     * Navbar dimensions
     */
    const CLOSED_HEIGHT = 72;
    const EXPANDED_HEIGHT = 360;


    const calculateHeight = useCallback(() => {
        const isMobile = window.matchMedia(
            "(max-width: 768px)"
        ).matches;

        if (isMobile) {
            const navEl = navRef.current;

            if (!navEl) {
                return EXPANDED_HEIGHT;
            }

            const contentEl = navEl.querySelector(
                ".card-nav-content"
            );

            if (contentEl) {
                return Math.max(
                    EXPANDED_HEIGHT,
                    contentEl.scrollHeight + CLOSED_HEIGHT + 24
                );
            }
        }

        return EXPANDED_HEIGHT;
    }, []);


    /*
     * Create GSAP animation
     */
    const createTimeline = useCallback(() => {
        const navEl = navRef.current;

        if (!navEl) {
            return null;
        }

        gsap.set(navEl, {
            height: CLOSED_HEIGHT,
            overflow: "hidden"
        });

        gsap.set(cardsRef.current, {
            y: 35,
            opacity: 0
        });

        const tl = gsap.timeline({
            paused: true
        });

        tl.to(navEl, {
            height: calculateHeight,
            duration: 0.45,
            ease
        });

        tl.to(
            cardsRef.current,
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease,
                stagger: 0.08
            },
            "-=0.15"
        );

        return tl;
    }, [calculateHeight, ease]);


    useLayoutEffect(() => {
        const tl = createTimeline();

        tlRef.current = tl;

        return () => {
            tl?.kill();
            tlRef.current = null;
        };
    }, [createTimeline, items]);


    /*
     * Handle window resize
     */
    useLayoutEffect(() => {
        const handleResize = () => {
            if (!tlRef.current || !navRef.current) {
                return;
            }

            if (isExpanded) {
                gsap.set(navRef.current, {
                    height: calculateHeight()
                });
            }
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, [calculateHeight, isExpanded]);


    /*
     * Open / close menu
     */
    const toggleMenu = () => {
        const tl = tlRef.current;

        if (!tl) {
            return;
        }

        if (!isExpanded) {
            setIsHamburgerOpen(true);
            setIsExpanded(true);

            tl.play(0);
        } else {
            setIsHamburgerOpen(false);

            tl.eventCallback(
                "onReverseComplete",
                () => {
                    setIsExpanded(false);
                }
            );

            tl.reverse();
        }
    };


    /*
     * Store card references
     */
    const setCardRef = (index) => (element) => {
        if (element) {
            cardsRef.current[index] = element;
        }
    };


    /*
     * Navigation
     */
    const handleLinkClick = (link) => {
        if (link.href === "#logout") {
            onLogout?.();
            return;
        }

        if (link.href) {
            onNavigate?.(link.href);

            setIsHamburgerOpen(false);

            const tl = tlRef.current;

            if (tl && isExpanded) {
                tl.eventCallback(
                    "onReverseComplete",
                    () => {
                        setIsExpanded(false);
                    }
                );

                tl.reverse();
            }
        }
    };


    return (
        <div
            className={`
        card-nav-container
        absolute
        left-1/2
        -translate-x-1/2
        w-[96%]
        max-w-[1450px]
        z-[99]
        top-[1em]
        md:top-[1.5em]
        ${className}
    `}
        >

            <nav
                ref={navRef}
                className={`
                    card-nav
                    ${isExpanded ? "open" : ""}
                    relative
                    block
                    rounded-2xl
                    shadow-xl
                    border
                    border-gray-200/70
                    overflow-hidden
                    will-change-[height]
                `}
                style={{
                    backgroundColor: baseColor
                }}
            >

                {/* =========================
                    TOP NAVBAR
                ========================= */}

                <div
                    className="
                        card-nav-top
                        relative
                        h-[72px]
                        w-full
                        flex
                        items-center
                        justify-between
                        px-3
                        md:px-4
                        z-[10]
                    "
                >

                    {/* HAMBURGER */}

                    <div
                        className={`
                            hamburger-menu
                            ${isHamburgerOpen ? "open" : ""}
                            group
                            w-[48px]
                            h-[48px]
                            rounded-xl
                            flex
                            flex-col
                            items-center
                            justify-center
                            cursor-pointer
                            gap-[7px]
                            transition-all
                            duration-300
                            hover:bg-gray-100
                            shrink-0
                        `}
                        onClick={toggleMenu}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" ||
                                e.key === " "
                            ) {
                                e.preventDefault();
                                toggleMenu();
                            }
                        }}
                        role="button"
                        aria-label={
                            isExpanded
                                ? "Close menu"
                                : "Open menu"
                        }
                        aria-expanded={isExpanded}
                        tabIndex={0}
                        style={{
                            color: menuColor
                        }}
                    >

                        <div
                            className={`
                                w-[27px]
                                h-[2px]
                                bg-current
                                transition-all
                                duration-300
                                ${isHamburgerOpen
                                    ? "translate-y-[4.5px] rotate-45"
                                    : ""
                                }
                            `}
                        />

                        <div
                            className={`
                                w-[27px]
                                h-[2px]
                                bg-current
                                transition-all
                                duration-300
                                ${isHamburgerOpen
                                    ? "-translate-y-[4.5px] -rotate-45"
                                    : ""
                                }
                            `}
                        />

                    </div>


                    {/* =========================
                        CENTER LOGO
                    ========================= */}

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            h-[72px]
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <img
                            src={logo}
                            alt={logoAlt}
                            className="
                                block
                                h-[60px]
                                md:h-[64px]
                                w-auto
                                max-w-[280px]
                                object-contain
                                translate-y-[1px]
                            "
                        />

                    </div>


                    {/* =========================
                        HOME BUTTON
                    ========================= */}

                    <button
                        type="button"
                        onClick={() =>
                            onNavigate?.("/home")
                        }
                        className="
                            ml-auto
                            w-[84px]
                            h-[48px]
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            font-medium
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-[1.02]
                            hover:opacity-90
                            shrink-0
                        "
                        style={{
                            backgroundColor:
                                buttonBgColor,
                            color:
                                buttonTextColor
                        }}
                    >
                        Home
                    </button>

                </div>


                {/* =========================
                    EXPANDED MENU
                ========================= */}

                <div
                    className={`
                        card-nav-content
                        absolute
                        left-0
                        right-0
                        top-[72px]
                        bottom-0
                        p-3
                        flex
                        items-stretch
                        gap-3
                        z-[5]
                        ${isExpanded
                            ? "visible pointer-events-auto"
                            : "invisible pointer-events-none"
                        }
                    `}
                    aria-hidden={!isExpanded}
                >

                    {items
                        .slice(0, 3)
                        .map((item, index) => (
                            <div
                                key={`${item.label}-${index}`}
                                ref={setCardRef(index)}
                                className="
                                    nav-card
                                    relative
                                    flex
                                    flex-col
                                    gap-3
                                    p-5
                                    rounded-xl
                                    min-w-0
                                    flex-1
                                    h-full
                                "
                                style={{
                                    backgroundColor:
                                        item.bgColor,
                                    color:
                                        item.textColor
                                }}
                            >

                                {/* CARD TITLE */}

                                <div
                                    className="
                                        nav-card-label
                                        font-medium
                                        tracking-[-0.5px]
                                        text-[20px]
                                        md:text-[23px]
                                        shrink-0
                                    "
                                >
                                    {item.label}
                                </div>


                                {/* LINKS */}

                                <div
                                    className="
                                        nav-card-links
                                        flex
                                        flex-col
                                        gap-[8px]
                                        mt-auto
                                        pb-1
                                    "
                                >

                                    {item.links?.map(
                                        (
                                            link,
                                            linkIndex
                                        ) => (
                                            <button
                                                key={`${link.label}-${linkIndex}`}
                                                type="button"
                                                className="
                                                    nav-card-link
                                                    inline-flex
                                                    items-center
                                                    gap-[7px]
                                                    text-left
                                                    cursor-pointer
                                                    transition-all
                                                    duration-300
                                                    hover:translate-x-1
                                                    hover:opacity-70
                                                    text-[14px]
                                                    md:text-[15px]
                                                    bg-transparent
                                                    border-none
                                                    p-0
                                                    w-fit
                                                "
                                                aria-label={
                                                    link.ariaLabel
                                                }
                                                onClick={() =>
                                                    handleLinkClick(
                                                        link
                                                    )
                                                }
                                            >

                                                <GoArrowUpRight
                                                    className="shrink-0"
                                                    aria-hidden="true"
                                                />

                                                {link.label}

                                            </button>
                                        )
                                    )}

                                </div>

                            </div>
                        ))}

                </div>

            </nav>

        </div>
    );
};

export default CardNav;
