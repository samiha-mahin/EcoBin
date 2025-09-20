// @ts-nocheck
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const clientId = "BJy20ZeuPWFxidi1_PXkfrSVgeoEwje58QXet3PG0usyKLiopVpI38G2t566e8JHTXmfnHRvFqdCuK2pvHdlv1Q";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // fix: match your project network
  chainConfig,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick,totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  //  Initialize Web3Auth
  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        await web3auth.init(); // v2
        if (web3auth.provider) {
          setProvider(web3auth.provider);
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);

          if (user.email) {
            localStorage.setItem("userEmail", user.email);
            await fetch("/api/user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, name: user.name || "Anonymous User" }),
            });
          }
        }
      } catch (err) {
        console.error("Web3Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };
    initWeb3Auth();
  }, []);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userInfo?.email) return;
      const userRes = await fetch(`/api/user?email=${userInfo.email}`);
      const user = await userRes.json();
      if (user?.id) {
        const notifRes = await fetch(`/api/user/notifications?userId=${user.id}`);
        const data = await notifRes.json();
        setNotifications(data || []);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  // Fetch Balance 
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userInfo?.email) return;
      const userRes = await fetch(`/api/user?email=${userInfo.email}`);
      const user = await userRes.json();
      if (user?.id) {
        const balanceRes = await fetch(`/api/user/balance?userId=${user.id}`);
        const data = await balanceRes.json();
        setBalance(data?.balance || 0);
      }
    };
    fetchBalance();

    const handleBalanceUpdate = (event: CustomEvent) => setBalance(event.detail);
    window.addEventListener("balanceUpdated", handleBalanceUpdate as EventListener);
    return () => window.removeEventListener("balanceUpdated", handleBalanceUpdate as EventListener);
  }, [userInfo]);

  // Login / Logout Functions
  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);

      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, name: user.name || "Anonymous User" }),
        });
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await fetch(`/api/user/notifications/${notificationId}`, { method: "PATCH" });
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (loading) return <div>Loading Web3Auth...</div>;

  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">

        {/* Logo + Menu */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-gray-800">EcoBin</span>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">Saving The Nature</span>
            </div>
          </Link>
        </div>

        {/* Search */}
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}

        {/* Notifications + Balance + User */}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">{notifications.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0
                ? notifications.map(n => (
                    <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{n.type}</span>
                        <span className="text-sm text-gray-500">{n.message}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                : <DropdownMenuItem>No new notifications</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Balance */}
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">{balance.toFixed(2)}</span>
          </div>

          {/* User */}
          {!loggedIn ? (
            <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white
            text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-4 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 flex items-center rounded-lg md:rounded-xl lg:rounded-2xl transition-all duration-200">
              Login <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center">
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{userInfo?.name || "Anonymous User"}</DropdownMenuItem>
                <DropdownMenuItem><Link href="/settings">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
