import { useEffect, useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { RiMusic2Line } from 'react-icons/ri'; // 음악 아이콘 추가
import { Button, Text, Box, IconButton } from '@chakra-ui/react'; // Chakra UI 버튼과 텍스트 컴포넌트

interface Props {
  textData: string[];
}

interface VariantProps {
  scaleY: number;
  y: string | number;
  opacity: number;
  filter?: string;
}

const ARRAY_REPEAT = 5;

const SlotMachine = ({ textData }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 슬롯에서 보여주는 곡의 인덱스
  const [isSpinning, setIsSpinning] = useState(false); // 슬롯머신이 도는 상태인지 여부
  const [isStarted, setIsStarted] = useState(false); // 사용자가 첫 클릭했는지 여부
  const [isClickable, setIsClickable] = useState(true); // 한번 클릭 후 더이상 클릭 못하도록
  const [finalIndex, setFinalIndex] = useState(0); // 슬롯이 멈춘 후 보여줄 곡의 인덱스

  // 날짜에 맞게 인덱스를 설정
  const today = new Date().getDate() - 1; // 1일 -> 0번 인덱스로 맞추기 위해 -1
  const shuffledTextData = [...textData].sort(() => Math.random() - 0.5);
  const textArr = Array(ARRAY_REPEAT).fill(shuffledTextData).flat(); // 곡 리스트 반복
  const lastIndex = textArr.length - 1; // 마지막 곡 인덱스

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSpinning) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev < lastIndex ? prev + 1 : 0)); // 슬롯이 끝에 도달하면 처음으로 돌아가기
      }, getDuration(10, currentIndex));
    }

    return () => clearInterval(interval);
  }, [currentIndex, lastIndex, isSpinning]);

  // 애니메이션 설정
  const variants: Variants = {
    initial: { scaleY: 0.8, y: '-50%', opacity: 0.5 },
    animate: ({ isLast }) => {
      let props: VariantProps = { scaleY: 1, y: 0, opacity: 1 };
      if (!isLast) props['filter'] = 'none'; // 블러 제거하여 가독성 개선
      return props;
    },
    exit: { scaleY: 0.8, y: '50%', opacity: 0.5 },
  };

  function handleClick() {
    if (isClickable) {
      setIsStarted(true); // 첫 클릭 후 시작
      setIsSpinning(true); // 슬롯 돌리기 시작
      setIsClickable(false); // 클릭 불가로 설정
      setTimeout(() => {
        setIsSpinning(false); // 일정 시간 후 슬롯 멈춤
        setFinalIndex(today); // 멈추면 오늘 날짜에 해당하는 인덱스 설정
      }, 2000); // 2초 동안 돌게 설정
    }
  }

  function getDuration(base: number, index: number) {
    return base * (index + 1) * 0.5;
  }

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {/* 첫 번째 상태: 슬롯이 돌기 전 */}
      {!isStarted && (
        <Box display="flex" alignItems="center" justifyContent="center" gap="10px">
          <Text fontSize="14px" fontWeight="bold" color={isClickable ? 'black' : 'gray'}>
            버튼을 클릭해주세요!
          </Text>
          <IconButton
            onClick={handleClick}
            isDisabled={!isClickable}
            colorScheme="blue"
            aria-label="추천곡 시작"
            height="24px"
            icon={<RiMusic2Line />}
            borderRadius="full"
          />
        </Box>
      )}

      {/* 슬롯머신 동작: 슬롯이 시작되면 보여줌 */}
      {isStarted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          
          {/* 추천곡 레이블: 슬롯이 멈춘 후에만 보여줌 */}
          {!isSpinning && (
            <>
              <RiMusic2Line color="#3b82f6" size="20px" />
              <Text fontSize="sm" fontWeight="bold" flexShrink={0}>오늘의 엔피곡 :</Text>
            </>
          )}
          {/* 추천곡 텍스트 */}
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '200px' }}>
            <AnimatePresence mode="popLayout">
              <motion.span
                className="slotMachineText"
                key={isSpinning ? textArr[currentIndex] : textData[finalIndex]}
                custom={{ isLast: currentIndex === lastIndex }}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: getDuration(currentIndex === lastIndex ? 0.1 : 0.01, currentIndex),
                  ease: currentIndex === lastIndex ? 'easeInOut' : 'linear',
                }}
                style={{
                  fontSize: '14px', // 글자 크기
                  fontWeight: 'bold',
                  color: '#3b82f6', // 추천곡 색상
                  animation: 'glow 2s infinite',
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  overflow: 'hidden', // Hide overflow
                  textOverflow: 'ellipsis', // Add ellipsis for overflow
                  textAlign: 'center', // Center the text
                  width: '100%', // Full width to ensure it takes up space
                }}
              >
                {isSpinning ? textArr[currentIndex] : textData[finalIndex]} {/* 슬롯이 멈추면 날짜에 맞는 곡 출력 */}
              </motion.span>
            </AnimatePresence>
          </div>
          
        </div>
      )}

      <style>
        {`
          @keyframes glow {
            0% { text-shadow: 0 0 2px #0597F2; }
            50% { text-shadow: 0 0 6px #0597F2; }
            100% { text-shadow: 0 0 2px #0597F2; }
          }
        `}
      </style>
    </div>
  );
};

export default SlotMachine;