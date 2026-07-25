import { useEffect, useState } from 'react';
import femaleMannequin from '../../../assets/images/female_mannequin.jpeg';
import maleMannequin from '../../../assets/images/male_mannequin.jpeg';
import {
  generateCustomizePreview,
  saveDesignProject,
} from '../services/customizePreviewService';
import { getTempPreviewKey, readTempPreviewMap, saveTempPreview } from '../utils/previewStorage';
import { MannequinType, ServiceRow, VendorRow } from '../types';

interface UseCustomizePreviewInput {
  activeProductId: string | undefined;
  activeService: ServiceRow | undefined;
  activeTab: string;
  currentMainImage: string;
  inputValue: string;
  selectedMannequin: MannequinType;
  userId: string | null;
  vendorInfo: VendorRow | null;
  appendAssistantMessage: (text: string) => void;
  appendUserMessage: (text: string) => void;
  persistMessage: (role: string, content: string) => Promise<void>;
  setInputValue: (value: string) => void;
}

interface UseCustomizePreviewResult {
  generatedPreviewUrl: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  mannequinImage: string;
  previewImage: string;
  handleGeneratePreview: () => Promise<void>;
  handleSaveDesign: () => Promise<void>;
}

export function useCustomizePreview({
  activeProductId,
  activeService,
  activeTab,
  currentMainImage,
  inputValue,
  selectedMannequin,
  userId,
  vendorInfo,
  appendAssistantMessage,
  appendUserMessage,
  persistMessage,
  setInputValue,
}: UseCustomizePreviewInput): UseCustomizePreviewResult {
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mannequinImage = selectedMannequin === 'male' ? maleMannequin : femaleMannequin;
  const previewImage = generatedPreviewUrl || mannequinImage;

  useEffect(() => {
    const tempKey = getTempPreviewKey(activeTab, activeProductId, selectedMannequin);
    setGeneratedPreviewUrl(tempKey ? readTempPreviewMap()[tempKey] || null : null);
  }, [activeTab, activeProductId, selectedMannequin]);

  const handleGeneratePreview = async () => {
    const customPrompt = inputValue.trim();
    const userText = customPrompt || 'Tạo ảnh xem trước từ các tùy chọn hiện tại.';

    if (!activeService || !currentMainImage) {
      appendAssistantMessage('Bé Song cần bạn chọn một sản phẩm trước khi tạo ảnh thử đồ nha!');
      return;
    }

    appendUserMessage(userText);
    setInputValue('');
    setIsGenerating(true);
    await persistMessage('user', userText);

    try {
      const result = await generateCustomizePreview({
        activeTab,
        activeService,
        currentMainImage,
        customPrompt,
        mannequinImage,
        vendorInfo,
      });
      const tempKey = getTempPreviewKey(activeTab, activeProductId, selectedMannequin);

      setGeneratedPreviewUrl(result.imageUrl);
      saveTempPreview(tempKey, result.imageUrl);
      appendAssistantMessage(result.message);
      await persistMessage('assistant', result.message);
    } catch (error) {
      console.error('Lỗi khi gọi VTON backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fallbackText = `Bé Song chưa thể tạo ảnh thử đồ. Chi tiết: ${errorMessage}`;
      appendAssistantMessage(fallbackText);
      await persistMessage('assistant', fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!activeService) return;
    if (!userId) {
      alert('Vui lòng đăng nhập để lưu thiết kế.');
      return;
    }

    setIsSaving(true);
    try {
      await saveDesignProject(userId, activeTab, activeService);
      alert('Lưu thiết kế thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu thiết kế:', error);
      alert('Đã xảy ra lỗi khi lưu thiết kế. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generatedPreviewUrl,
    isGenerating,
    isSaving,
    mannequinImage,
    previewImage,
    handleGeneratePreview,
    handleSaveDesign,
  };
}
