from dataclasses import dataclass

@dataclass
class Note:
    content: str
    timestamp: str

    def to_dict(self):
        return {
            "content": self.content,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            content=data["content"],
            timestamp=data["timestamp"]
        )

    def __str__(self) -> str:
        return f"{self.timestamp} - {self.content}"