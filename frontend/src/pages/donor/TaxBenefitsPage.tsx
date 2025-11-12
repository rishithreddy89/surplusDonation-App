import { useEffect, useState } from 'react';
import { TaxBenefits } from '@/components/TaxBenefits';
import { getDonorSurplus } from '@/lib/api';

const TaxBenefitsPage = () => {
  const [deliveredDonations, setDeliveredDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveredDonations();
  }, []);

  const loadDeliveredDonations = async () => {
    try {
      setLoading(true);
      const response = await getDonorSurplus({ status: 'delivered' });
      if (response.success) {
        setDeliveredDonations(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load delivered donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tax Benefits</h1>
        <p className="text-muted-foreground mt-1">
          Generate 80G receipts for your delivered donations
        </p>
      </div>
      <TaxBenefits deliveredDonations={deliveredDonations} />
    </div>
  );
};

export default TaxBenefitsPage;
