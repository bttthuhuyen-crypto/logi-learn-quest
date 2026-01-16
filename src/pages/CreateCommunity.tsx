import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Lock, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/community/ImageUploader';
import { useCommunityCategories } from '@/hooks/useCommunityCategories';
import { useCreateCommunity, CommunityFormData } from '@/hooks/useCreateCommunity';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreateCommunity() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCommunityCategories();
  const { createCommunity, generateSlug, isLoading } = useCreateCommunity();

  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    slug: '',
    description: '',
    category: '',
    isPublic: true,
    requiresApproval: false,
    price: 0,
    pricePeriod: 'month',
    logo: undefined,
    cover: undefined,
  });

  const [isPaid, setIsPaid] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/community/create' } });
    }
  }, [user, authLoading, navigate]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name, slugEdited, generateSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await createCommunity({
      ...formData,
      price: isPaid ? formData.price : 0,
    });
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setFormData(prev => ({
      ...prev,
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    }));
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/discover" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại khám phá
          </Link>
          <h1 className="text-2xl font-bold">Tạo cộng đồng của bạn</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo cộng đồng mới
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Thương hiệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Images */}
              <div className="flex gap-4 items-start">
                <ImageUploader
                  type="logo"
                  onChange={(file) => setFormData(prev => ({ ...prev, logo: file || undefined }))}
                />
                <div className="flex-1">
                  <ImageUploader
                    type="cover"
                    onChange={(file) => setFormData(prev => ({ ...prev, cover: file || undefined }))}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên cộng đồng *</Label>
                <Input
                  id="name"
                  placeholder="VD: Logistics Việt Nam"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL tùy chỉnh</Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0">
                    /c/
                  </span>
                  <Input
                    id="slug"
                    className="rounded-l-none"
                    placeholder="ten-cong-dong"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về cộng đồng của bạn..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                    ) : (
                      categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.emoji} {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <Label>Quyền riêng tư</Label>
                <RadioGroup
                  value={formData.isPublic ? 'public' : 'private'}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    isPublic: value === 'public' 
                  }))}
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="public" id="public" className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor="public" className="flex items-center gap-2 font-medium cursor-pointer">
                        <Globe className="w-4 h-4" />
                        Công khai
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Ai cũng có thể tìm và xem cộng đồng này
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="private" id="private" className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor="private" className="flex items-center gap-2 font-medium cursor-pointer">
                        <Lock className="w-4 h-4" />
                        Riêng tư
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Chỉ thành viên mới có thể xem nội dung
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Requires Approval */}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Checkbox
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, requiresApproval: !!checked }))
                  }
                />
                <div className="flex-1">
                  <label htmlFor="requiresApproval" className="font-medium cursor-pointer">
                    Yêu cầu phê duyệt thành viên mới
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Thành viên mới cần được admin duyệt trước khi tham gia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Giá thành viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={isPaid ? 'paid' : 'free'}
                onValueChange={(value) => setIsPaid(value === 'paid')}
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="free" id="free" />
                  <label htmlFor="free" className="font-medium cursor-pointer">
                    Miễn phí
                  </label>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="paid" id="paid" className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="paid" className="font-medium cursor-pointer">
                      Trả phí
                    </label>
                    {isPaid && (
                      <div className="flex gap-2 mt-3">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            price: parseInt(e.target.value) || 0 
                          }))}
                          className="w-32"
                        />
                        <span className="flex items-center text-muted-foreground">đ /</span>
                        <Select
                          value={formData.pricePeriod}
                          onValueChange={(value: 'month' | 'year') => 
                            setFormData(prev => ({ ...prev, pricePeriod: value }))
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">tháng</SelectItem>
                            <SelectItem value="year">năm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              'Tạo cộng đồng'
            )}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
