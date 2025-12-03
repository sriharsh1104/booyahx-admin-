import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { useLoginLogic } from './Login.logic';
import './Login.scss';

const Login: React.FC = () => {
  const {
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit,
  } = useLoginLogic();

  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Left side animations
    if (leftSideRef.current) {
      const leftElements = leftSideRef.current.querySelectorAll('.gaming-element');
      
      animate(leftElements, {
        translateY: [
          { value: -30, duration: 2000 },
          { value: 0, duration: 2000 }
        ],
        translateX: [
          { value: -20, duration: 2500 },
          { value: 0, duration: 2500 }
        ],
        translateZ: [
          { value: -50, duration: 2500 },
          { value: 50, duration: 2500 },
          { value: -50, duration: 2500 }
        ],
        rotate: [
          { value: -15, duration: 3000 },
          { value: 0, duration: 3000 }
        ],
        rotateX: [
          { value: -20, duration: 3500 },
          { value: 20, duration: 3500 },
          { value: -20, duration: 3500 }
        ],
        rotateY: [
          { value: -25, duration: 4000 },
          { value: 25, duration: 4000 },
          { value: -25, duration: 4000 }
        ],
        opacity: [
          { value: 0.3, duration: 2000 },
          { value: 1, duration: 2000 }
        ],
        scale: [
          { value: 0.8, duration: 2500 },
          { value: 1.1, duration: 2500 },
          { value: 0.8, duration: 2500 }
        ],
        ease: 'easeInOutSine',
        loop: true,
        delay: stagger(200)
      });

      // Glowing orbs animation
      const leftOrbs = leftSideRef.current.querySelectorAll('.gaming-orb');
      animate(leftOrbs, {
        translateZ: [
          { value: -30, duration: 2000 },
          { value: 30, duration: 2000 },
          { value: -30, duration: 2000 }
        ],
        rotateX: [
          { value: 0, duration: 3000 },
          { value: 360, duration: 3000 }
        ],
        rotateY: [
          { value: 0, duration: 2500 },
          { value: 360, duration: 2500 }
        ],
        scale: [
          { value: 1, duration: 1500 },
          { value: 1.3, duration: 1500 },
          { value: 1, duration: 1500 }
        ],
        opacity: [
          { value: 0.4, duration: 1500 },
          { value: 0.8, duration: 1500 },
          { value: 0.4, duration: 1500 }
        ],
        ease: 'easeInOutQuad',
        loop: true,
        delay: stagger(300)
      });

      // Energy lines animation
      const leftLines = leftSideRef.current.querySelectorAll('.energy-line');
      animate(leftLines, {
        translateY: [
          { value: -100, duration: 3000 },
          { value: 100, duration: 3000 }
        ],
        translateZ: [
          { value: -20, duration: 2000 },
          { value: 20, duration: 2000 }
        ],
        rotateX: [
          { value: -15, duration: 4000 },
          { value: 15, duration: 4000 }
        ],
        opacity: [
          { value: 0, duration: 1000 },
          { value: 0.6, duration: 1000 },
          { value: 0, duration: 1000 }
        ],
        ease: 'linear',
        loop: true,
        delay: stagger(500)
      });
    }

    // Right side animations
    if (rightSideRef.current) {
      const rightElements = rightSideRef.current.querySelectorAll('.gaming-element');
      
      animate(rightElements, {
        translateY: [
          { value: -30, duration: 2000 },
          { value: 0, duration: 2000 }
        ],
        translateX: [
          { value: 20, duration: 2500 },
          { value: 0, duration: 2500 }
        ],
        translateZ: [
          { value: -50, duration: 2500 },
          { value: 50, duration: 2500 },
          { value: -50, duration: 2500 }
        ],
        rotate: [
          { value: 15, duration: 3000 },
          { value: 0, duration: 3000 }
        ],
        rotateX: [
          { value: 20, duration: 3500 },
          { value: -20, duration: 3500 },
          { value: 20, duration: 3500 }
        ],
        rotateY: [
          { value: 25, duration: 4000 },
          { value: -25, duration: 4000 },
          { value: 25, duration: 4000 }
        ],
        opacity: [
          { value: 0.3, duration: 2000 },
          { value: 1, duration: 2000 }
        ],
        scale: [
          { value: 0.8, duration: 2500 },
          { value: 1.1, duration: 2500 },
          { value: 0.8, duration: 2500 }
        ],
        ease: 'easeInOutSine',
        loop: true,
        delay: stagger(200)
      });

      // Glowing orbs animation
      const rightOrbs = rightSideRef.current.querySelectorAll('.gaming-orb');
      animate(rightOrbs, {
        translateZ: [
          { value: -30, duration: 2000 },
          { value: 30, duration: 2000 },
          { value: -30, duration: 2000 }
        ],
        rotateX: [
          { value: 0, duration: 3000 },
          { value: 360, duration: 3000 }
        ],
        rotateY: [
          { value: 0, duration: 2500 },
          { value: 360, duration: 2500 }
        ],
        scale: [
          { value: 1, duration: 1500 },
          { value: 1.3, duration: 1500 },
          { value: 1, duration: 1500 }
        ],
        opacity: [
          { value: 0.4, duration: 1500 },
          { value: 0.8, duration: 1500 },
          { value: 0.4, duration: 1500 }
        ],
        ease: 'easeInOutQuad',
        loop: true,
        delay: stagger(300)
      });

      // Energy lines animation
      const rightLines = rightSideRef.current.querySelectorAll('.energy-line');
      animate(rightLines, {
        translateY: [
          { value: -100, duration: 3000 },
          { value: 100, duration: 3000 }
        ],
        translateZ: [
          { value: -20, duration: 2000 },
          { value: 20, duration: 2000 }
        ],
        rotateX: [
          { value: 15, duration: 4000 },
          { value: -15, duration: 4000 }
        ],
        opacity: [
          { value: 0, duration: 1000 },
          { value: 0.6, duration: 1000 },
          { value: 0, duration: 1000 }
        ],
        ease: 'linear',
        loop: true,
        delay: stagger(500)
      });
    }

    // Particle effects
    const particles = document.querySelectorAll('.gaming-particle');
    animate(particles, {
      translateY: [
        { value: -200, duration: 4000 },
        { value: 200, duration: 4000 }
      ],
      translateX: [
        { value: -50, duration: 3000 },
        { value: 50, duration: 3000 }
      ],
      translateZ: [
        { value: -100, duration: 3500 },
        { value: 100, duration: 3500 },
        { value: -100, duration: 3500 }
      ],
      rotateX: [
        { value: 0, duration: 5000 },
        { value: 360, duration: 5000 }
      ],
      rotateY: [
        { value: 0, duration: 4500 },
        { value: 360, duration: 4500 }
      ],
      opacity: [
        { value: 0, duration: 1000 },
        { value: 0.7, duration: 2000 },
        { value: 0, duration: 1000 }
      ],
      scale: [
        { value: 0.5, duration: 2000 },
        { value: 1.2, duration: 2000 }
      ],
      ease: 'easeInOutQuad',
      loop: true,
      delay: stagger(400)
    });
  }, []);

  return (
    <div className="login-container">
      {/* Left side gaming elements */}
      <div className="gaming-side gaming-side-left" ref={leftSideRef}>
        <div className="gaming-orb gaming-orb-1"></div>
        <div className="gaming-orb gaming-orb-2"></div>
        <div className="gaming-element gaming-hexagon gaming-hexagon-1"></div>
        <div className="gaming-element gaming-triangle gaming-triangle-1"></div>
        <div className="gaming-element gaming-circle gaming-circle-1"></div>
        <div className="energy-line energy-line-1"></div>
        <div className="energy-line energy-line-2"></div>
        <div className="gaming-particle gaming-particle-1"></div>
        <div className="gaming-particle gaming-particle-2"></div>
        <div className="gaming-particle gaming-particle-3"></div>
      </div>

      {/* Login card */}
      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Sign in to access the dashboard</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Right side gaming elements */}
      <div className="gaming-side gaming-side-right" ref={rightSideRef}>
        <div className="gaming-orb gaming-orb-3"></div>
        <div className="gaming-orb gaming-orb-4"></div>
        <div className="gaming-element gaming-hexagon gaming-hexagon-2"></div>
        <div className="gaming-element gaming-triangle gaming-triangle-2"></div>
        <div className="gaming-element gaming-circle gaming-circle-2"></div>
        <div className="energy-line energy-line-3"></div>
        <div className="energy-line energy-line-4"></div>
        <div className="gaming-particle gaming-particle-4"></div>
        <div className="gaming-particle gaming-particle-5"></div>
        <div className="gaming-particle gaming-particle-6"></div>
      </div>
    </div>
  );
};

export default Login;

