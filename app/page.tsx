import HomeScreen from "./components/HomeScreen";
import MobileContainer from "./components/MobileContainer";
import OnboardingGate from "./components/OnboardingGate";

export default function Home() {
  return (
    <MobileContainer>
      <OnboardingGate>
        <HomeScreen />
      </OnboardingGate>
    </MobileContainer>
  );
}
