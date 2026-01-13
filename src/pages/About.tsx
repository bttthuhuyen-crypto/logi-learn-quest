import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Info, Mail, Globe, Users, BookOpen, Target } from 'lucide-react';

const About = () => {
  const { language } = useLanguage();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">10X Logistics</h1>
          <p className="text-xl text-muted-foreground">
            {language === 'vi' 
              ? 'Cộng đồng học tập và kết nối cho ngành Logistics'
              : 'Learning and networking community for Logistics industry'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 border rounded-lg">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{language === 'vi' ? 'Cộng đồng' : 'Community'}</h3>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' 
                ? 'Kết nối với hàng nghìn chuyên gia trong ngành'
                : 'Connect with thousands of industry experts'}
            </p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{language === 'vi' ? 'Học tập' : 'Learning'}</h3>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' 
                ? 'Khóa học chất lượng từ chuyên gia hàng đầu'
                : 'Quality courses from top experts'}
            </p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <Target className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{language === 'vi' ? 'Phát triển' : 'Growth'}</h3>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' 
                ? 'Nâng cao kỹ năng và phát triển sự nghiệp'
                : 'Enhance skills and advance your career'}
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            {language === 'vi' ? 'Quy tắc cộng đồng' : 'Community Guidelines'}
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>✓ {language === 'vi' ? 'Tôn trọng tất cả thành viên' : 'Respect all members'}</li>
            <li>✓ {language === 'vi' ? 'Chia sẻ kiến thức có giá trị' : 'Share valuable knowledge'}</li>
            <li>✓ {language === 'vi' ? 'Không spam hoặc quảng cáo' : 'No spam or advertising'}</li>
            <li>✓ {language === 'vi' ? 'Giữ nội dung chuyên nghiệp' : 'Keep content professional'}</li>
            <li>✓ {language === 'vi' ? 'Hỗ trợ và giúp đỡ lẫn nhau' : 'Support and help each other'}</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <h3 className="font-semibold mb-4">{language === 'vi' ? 'Liên hệ' : 'Contact'}</h3>
          <div className="flex justify-center gap-6">
            <a href="mailto:hello@10xlogistics.vn" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Mail className="h-5 w-5" />
              hello@10xlogistics.vn
            </a>
            <a href="https://10xlogistics.vn" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Globe className="h-5 w-5" />
              10xlogistics.vn
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
