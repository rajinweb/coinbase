import React from 'react';

interface SystemStatusProps {
  channels: string[];
  subscriptions:string[];
}

const SystemStatus: React.FC<SystemStatusProps> = ({ channels, subscriptions }) => {
  const formatChannelName = (channel: string) => {
    if (typeof channel === 'object' && channel !== null) {
      return `${(channel as any).name || 'Unknown Channel'}`;
    }
    return channel;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">System Status</h2>
      <div className="space-y-2">
        <h3 className="font-semibold">Subscribed Products and Channels:</h3>
        {(!channels || channels.length === 0) ? (
          <p className="text-gray-500">No active subscriptions</p>
        ) : (
          <ul className="list-disc list-inside">
            { 
            subscriptions.map((subs, index) => { 
              return(
                <li key={index} className="text-gray-700">
                  <span className='font-bold'>Product:</span> {subs} 
                  <span className='font-bold ml-2'> Channels: </span>  
                  {
                  channels.map((channel, idx) => <span key={idx}> {formatChannelName(channel)} </span> )
                  }
                </li>
              )
            })
            }
    
          </ul>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;