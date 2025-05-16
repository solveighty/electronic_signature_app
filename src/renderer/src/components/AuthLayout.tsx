import { useLocation, Outlet } from "react-router-dom";
import { useTransition, animated } from "@react-spring/web";
import { Container } from "@mantine/core";

const AuthLayout = () => {
  const location = useLocation();

  // Create transition for page changes
  const transitions = useTransition(location, {
    from: {
      opacity: 0,
      transform: "translate3d(100%,0,0)",
    },
    enter: {
      opacity: 1,
      transform: "translate3d(0%,0,0)",
    },
    leave: {
      opacity: 0,
      transform: "translate3d(-50%,0,0)",
      position: "absolute",
    },
    config: { tension: 220, friction: 22 },
  });

  return (
    <Container size="md" py="xl">
      {transitions((style) => (
        <animated.div style={{ ...style, width: "100%" }}>
          <Outlet />
        </animated.div>
      ))}
    </Container>
  );
};

export default AuthLayout;
