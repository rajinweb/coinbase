import React from 'react';

interface SubscriptionPanelProps {
  products: string[];
  subscriptions: string[];
  onSubscribe: (product: string) => void;
  onUnsubscribe: (product: string) => void;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({
  products,
  subscriptions,
  onSubscribe,
  onUnsubscribe,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Subscribe/Unsubscribe</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product} className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">{product}</span>
            <button
              onClick={() =>
                subscriptions.includes(product)
                  ? onUnsubscribe(product)
                  : onSubscribe(product)
              }
              className={`px-4 py-2 rounded ${
                subscriptions.includes(product)
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {subscriptions.includes(product) ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPanel;