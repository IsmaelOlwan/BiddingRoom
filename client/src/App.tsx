import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "./pages/landing";
import CreateRoomPage from "./pages/create-room";
import RoomReadyPage from "./pages/room-ready";
import BiddingRoomPage from "./pages/bidding-room";
import OwnerViewPage from "./pages/owner-view";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/create" component={CreateRoomPage} />
      <Route path="/room/ready/:id" component={RoomReadyPage} />
      <Route path="/room/:id" component={BiddingRoomPage} />
      <Route path="/room/owner/:token" component={OwnerViewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
