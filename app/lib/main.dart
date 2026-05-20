import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

void main() {
  runApp(const ProviderScope(child: SakbolApp()));
}

class SakbolApp extends StatelessWidget {
  const SakbolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "SakBol",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF004253),
      ),
      home: const _Placeholder(),
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Text("SakBol", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text("Phase 0 scaffold — Android + Web"),
          ],
        ),
      ),
    );
  }
}
