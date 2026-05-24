import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sakbol_app/main.dart';

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SakbolApp()));
    expect(find.byType(MaterialApp), findsNothing); // MaterialApp.router
    expect(find.byType(ProviderScope), findsOneWidget);
  });
}
