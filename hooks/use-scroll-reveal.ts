"use client";

import { useEffect, useRef } from "react";

/**
 * Intersection Observer hook that adds 'revealed' class
 * to elements with the 'reveal' or 'stagger-children' class.
 */
export function useScrollReveal() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const elements = container.querySelectorAll(".reveal, .stagger-children");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return containerRef;
}
