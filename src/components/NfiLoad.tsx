import React, { useState } from "react";
import {
  Box,
  Input,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";

type Nfiload = {
  id: number;
  name: string;
  location: string;
  category: string;
  lat: string;
  lng: string;
};

interface NfiLoadProps {
  nfiload: Nfiload[];
  setSelectedNfiLoad: (nfiload: Nfiload) => void;
  selectedNfiLoad: Nfiload | null;
}

const NfiLoad = ({ nfiload, setSelectedNfiLoad, selectedNfiLoad }: NfiLoadProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNfiload = nfiload.filter(
    (data) =>
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNfiLoadClick = (data: Nfiload) => {
    setSelectedNfiLoad(data);
  };

  return (
    <VStack spacing={4} align="start">
      <Input 
        placeholder="이름이나 장소로 검색하세요." 
        size="md" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredNfiload.map((data) => (
        <Flex
          key={data.id}
          onClick={() => handleNfiLoadClick(data)}
          cursor="pointer"
          p="10px"
          border="1px solid #eee"
          borderRadius="4px"
          w="100%"
          _hover={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          position="relative"
          bg={selectedNfiLoad?.id === data.id ? "blue.50" : "white"}
        >
          <Box flexGrow={1}>
            <Text fontSize="16px" fontWeight="bold" mb="5px">
              {data.name}
            </Text>
            <Text fontSize="14px" color="#666">
              {data.location}
            </Text>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

export default NfiLoad;