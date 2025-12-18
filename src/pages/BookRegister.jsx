import "./BookRegister.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function BookRegister() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("로맨스");
    const [coverImage, setCoverImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);


    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [user, navigate]);

    // ✅ 아직 user를 못 받았을 땐 렌더링 중단
    if (!user) return null;

    // ✅ AI 표지 생성 함수
    const generateImage = async () => {
        if (!content) {
            alert("소개를 입력해주세요.");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: `Create a book cover image for a ${category} book. Description: ${content}`,
                    n: 1,
                    size: "1024x1024",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    },
                }
            );

            if (response.data && response.data.data && response.data.data.length > 0) {
                setCoverImage(response.data.data[0].url);
            }
        } catch (e) {
            console.error(e);
            alert("이미지 생성 실패");
        } finally {
            setIsGenerating(false);
        }
    };

    // 등록 버튼
    const handleSubmit = async () => {
        try {
            await axios.post(
                `http://localhost:8080/api/books/${user.id}`,
                {
                    title,
                    content,
                    category,
                    coverImageUrl: coverImage, // 백엔드 필드명에 맞춤
                }
            );

            navigate("/");
        } catch (e) {
            console.error(e);
            // 에러 메시지를 구체적으로 표시
            const errorMessage = e.response?.data?.message || e.message || "도서 등록 실패";
            alert(`도서 등록 실패: ${errorMessage}`);
        }
    };

    return (
        <div className="book-register">
            <h2 className="page-title">도서 등록</h2>

            <div className="form-group">
                <label>1. 작품의 제목을 입력해주세요. (최대 50자)</label>
                <input
                    type="text"
                    value={title}
                    maxLength={50}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="count">{title.length}/50</div>
            </div>

            <div className="form-group">
                <label>2. 작품에 대한 소개를 입력해주세요. (최대 300자)</label>
                <textarea
                    value={content}
                    maxLength={300}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="count">{content.length}/300</div>
            </div>

            <div className="form-group">
                <label>카테고리</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="로맨스">로맨스</option>
                    <option value="SF">SF</option>
                    <option value="공포">공포</option>
                    <option value="추리">추리</option>
                    <option value="역사">역사</option>
                    <option value="시">시</option>
                </select>
            </div>

            {/* ✅ AI 표지 생성 섹션 */}
            <div className="form-group">
                <label>AI 표지 생성</label>
                <div className="ai-generation">
                    <button
                        className="generate-btn"
                        onClick={generateImage}
                        disabled={isGenerating || !content}
                    >
                        {isGenerating ? "생성 중..." : "AI 표지 생성"}
                    </button>
                    {coverImage && (
                        <div className="generated-image">
                            <img src={coverImage} alt="Generated Cover" style={{ maxWidth: "100%", marginTop: "10px" }} />
                        </div>
                    )}
                </div>
            </div>


            <div className="actions">
                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "등록 중..." : "등록"}
                </button>

                <button
                    className="cancel-btn"
                    onClick={() => navigate("/")}
                >
                    취소
                </button>
            </div>
        </div>
    );
}

export default BookRegister;
