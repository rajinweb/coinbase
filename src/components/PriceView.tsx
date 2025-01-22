import React, { useEffect, useState } from 'react';

interface PriceViewProps {
  level2Data: any;
  subscriptions: string[];
}

const PriceView: React.FC<PriceViewProps> = ({ level2Data, subscriptions }) => {
  const [displayData, setDisplayData] = useState<any>(level2Data);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayData(level2Data);
    }, 50);

    return () => clearInterval(interval);
  }, [level2Data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Price View</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map((product) => (
          <div key={product} className="border rounded p-4">
            <h3 className="font-bold mb-2">{product}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Bids</h4>
                <div className="space-y-1">
                  {displayData[product]?.bids?.slice(0, 5).map((bid: any, i: number) => (
                    <div key={i} className="text-sm">
                      {bid[1]} @ {bid[2]}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Asks</h4>
                <div className="space-y-1">
                  {displayData[product]?.asks?.slice(0, 5).map((ask: any, i: number) => (
                    <div key={i} className="text-sm">
                      {ask[1]} @ {ask[2]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceView;