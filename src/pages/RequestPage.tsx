import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle, Phone, ShoppingBag } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';
import { useSiteData } from '../contexts/SiteDataContext';
import { saveMessage } from '../lib/db';

interface FormData {
  name: string;
  phone: string;
  comment: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

interface Request {
  id: string;
  name: string;
  phone: string;
  comment: string;
  productId?: number;
  productName?: string;
  productPrice?: number;
  date: string;
  status: 'new' | 'read' | 'responded';
}

const REQUESTS_STORAGE_KEY = 'sofia_furniture_requests';
const MESSAGES_STORAGE_KEY = 'sofia_messages';

export default function RequestPage() {
  const { getText } = usePageContent();
  const { products } = useSiteData();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    comment: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const productId = searchParams.get('product');
  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return products.find(p => String(p.id) === productId) || null;
  }, [productId, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const saveRequest = (data: FormData, product: typeof selectedProduct) => {
    const requests: Request[] = JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || '[]');
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      comment: data.comment,
      productId: product?.id,
      productName: product?.name,
      productPrice: product?.price,
      date: new Date().toISOString(),
      status: 'new'
    };
    requests.unshift(newRequest);
    if (requests.length > 100) {
      requests.pop();
    }
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));

    const messages: Request[] = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
    messages.unshift(newRequest);
    if (messages.length > 100) {
      messages.pop();
    }
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

    const productInfo = product ? `${product.name} (${product.price} ₽)` : undefined;
    saveMessage(data.name, data.phone, data.comment || undefined, productInfo).catch(() => {});

    const notificationEmail = localStorage.getItem('sofia_contact_email') || 'info@sofia.ru';
    console.log(`Email notification would be sent to: ${notificationEmail}`);
    console.log('New request:', newRequest);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = getText('request-error-name');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = getText('request-error-phone');
    } else if (!/^\+?[\d\s()-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = getText('request-error-phone-format');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    saveRequest(formData, selectedProduct);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);

    setFormData({
      name: '',
      phone: '',
      comment: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
      if (value.length <= 1) {
        value = '+' + value;
      } else if (value.length <= 4) {
        value = '+' + value.substring(1, 4) + ' ' + value.substring(4);
      } else if (value.length <= 7) {
        value = '+' + value.substring(1, 4) + ' ' + value.substring(4, 7) + ' ' + value.substring(7);
      } else if (value.length <= 9) {
        value = '+' + value.substring(1, 4) + ' ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
      }
    }

    setFormData((prev) => ({ ...prev, phone: value }));

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <main className="pt-24 pb-16 min-h-screen flex items-center bg-background">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center bg-card text-card-foreground border border-border rounded-2xl shadow-sm p-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1
              className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4"
              data-text="request-success-title"
            >
              {getText('request-success-title')}
            </h1>
            <p className="text-muted-foreground mb-8" data-text="request-success-text">
              {getText('request-success-text')}
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="btn-primary"
              data-text="request-success-btn"
            >
              {getText('request-success-btn')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16 bg-background min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-text="request-title"
          >
            {getText('request-title')}
          </h1>
          <p className="text-muted-foreground text-lg" data-text="request-subtitle">
            {getText('request-subtitle')}
          </p>
        </div>

        <div className={`${selectedProduct ? 'grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch' : 'max-w-2xl mx-auto'}`}>
          {/* Form */}
          <div className={selectedProduct ? 'lg:col-span-3 flex' : ''}>
            <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 lg:p-8 w-full flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-foreground"
                    data-text="request-name-label"
                  >
                    {getText('request-name-label')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={getText('request-name-placeholder')}
                    className={`input-field ${errors.name ? 'border-destructive focus:ring-destructive' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2 text-foreground"
                    data-text="request-phone-label"
                  >
                    {getText('request-phone-label')} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder={getText('request-phone-placeholder')}
                      className={`input-field pl-12 ${errors.phone ? 'border-destructive focus:ring-destructive' : ''}`}
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium mb-2 text-foreground"
                    data-text="request-comment-label"
                  >
                    {getText('request-comment-label')}
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder={getText('request-comment-placeholder')}
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                  data-text="request-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {getText('request-sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {getText('request-btn')}
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground" data-text="request-privacy">
                  {getText('request-privacy')}
                </p>
              </form>
            </div>
          </div>

{/* Product Card */}
          {selectedProduct && (
            <div className="lg:col-span-2 flex">
              <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-4 w-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Выбранный товар</h3>
                </div>
                <div className="relative overflow-hidden bg-muted rounded-xl mb-4" style={{ height: '180px' }}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{selectedProduct.category}</p>
                  <h4 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {selectedProduct.name}
                  </h4>
                  {selectedProduct.material && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Материал: {selectedProduct.material}
                    </p>
                  )}
                  <div className="text-2xl font-bold text-accent mt-auto">
                    {formatPrice(selectedProduct.price)}
                  </div>
                </div>
              </div>
            </div>
          )}
                  <div className="text-2xl font-bold text-accent mt-auto">
                    {formatPrice(selectedProduct.price)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {!selectedProduct && (
            <div className="mt-8 text-center max-w-2xl mx-auto">
              <p className="text-muted-foreground mb-4" data-text="request-contact-text">
                {getText('request-contact-text')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`tel:${getText('common-phone-1').replace(/[^+\d]/g, '')}`}
                  className="text-accent hover:underline font-medium"
                  data-text="phone-1"
                >
                  {getText('common-phone-1')}
                </a>
                <a
                  href={`tel:${getText('common-phone-2').replace(/[^+\d]/g, '')}`}
                  className="text-accent hover:underline font-medium"
                  data-text="phone-2"
                >
                  {getText('common-phone-2')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}