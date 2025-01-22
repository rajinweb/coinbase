import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import SubscriptionPanel from './SubscriptionPanel';
import PriceView from './PriceView';
import MatchView from './MatchView';
import SystemStatus from './SystemStatus';
import { Link } from 'react-router-dom';

const PRODUCTS = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'];

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [level2Data, setLevel2Data] = useState<any>({});
  const [matches, setMatches] = useState<any[]>([]);
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('update', (message) => {
      if (message.type === 'l2update') {
        setLevel2Data((prev: any) => ({
          ...prev,
          [message.product_id]: {
            bids: message.changes.filter((c: any) => c[0] === 'buy'),
            asks: message.changes.filter((c: any) => c[0] === 'sell'),
          },
        }));
      } else if (message.type === 'match') {
        setMatches((prev) => [message, ...prev].slice(0, 100));
      } else if (message.type === 'subscriptions') {
        // Extract channel names from the subscriptions message
        const channelNames = Array.isArray(message.channels) 
          ? message.channels.map((channel: any) => channel.name || channel)
          : [];
        setChannels(channelNames);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const handleSubscribe = (product: string) => {
    if (!subscriptions.includes(product)) {
      socket.emit('subscribe', {
        products: [...subscriptions, product],
        channels: ['level2', 'matches'],
      });
      setSubscriptions([...subscriptions, product]);
    }
  };

  const handleUnsubscribe = (product: string) => {
    if (subscriptions.includes(product)) {
      socket.emit('unsubscribe', {
        products: [product],
        channels: ['level2', 'matches'],
      });
      setSubscriptions(subscriptions.filter((p) => p !== product));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
       <div className='h-[50px] text-right'>
        <Link to="/" onClick={logout} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm">
              Logout</Link>
              </div>  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionPanel
          products={PRODUCTS}
          subscriptions={subscriptions}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
        />
        <SystemStatus channels={channels} subscriptions={subscriptions}/>
        <PriceView level2Data={level2Data} subscriptions={subscriptions} />
        <MatchView matches={matches} subscriptions={subscriptions} />
      </div>
    </div>
  );
};

export default Dashboard;